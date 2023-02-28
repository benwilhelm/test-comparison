import { isEqual } from 'lodash';
interface Comparison {
  value: unknown;
  message: string;
  comparator: Comparator;
}
export interface Run {
  name: string;
  checks: Comparison[];
}

class RunBroker {
  private _runs: Run[] = [];

  constructor(private factors: Factor[]) {}

  check(
    runIndex: number,
    comparison: Comparison,
    cb?: (result: Result) => void
  ) {
    const run = this._runs[runIndex] || {
      name: this.factors[runIndex].name,
      checks: [],
    };
    this._runs[runIndex] = run;
    run.checks.push(comparison);

    if (cb && runIndex === this.factors.length - 1) {
      const checkIndex = run.checks.length - 1;
      const result = this.getResult(checkIndex);
      cb(result);
    }
  }

  get runs() {
    return this._runs;
  }

  get results(): Result[] {
    const runs = this.runs;
    return runs[0].checks.map((check, checkIndex) =>
      this.getResult(checkIndex)
    );
  }

  getResult(resultIndex: number) {
    if (!this.runs[this.factors.length - 1].checks[resultIndex]) {
      throw new Error("Can't get that result until all runs are complete");
    }

    const runs = this.runs;
    const check = this.runs[0].checks[resultIndex];
    const { comparator } = check;

    const runResults = runs.map((run, runIdx) => ({
      value: run.checks[resultIndex].value,
      name: runs[runIdx].name,
    }));

    const ok = runResults.reduce((isOk, check, checkIdx) => {
      if (!isOk) return false;
      if (checkIdx === 0) return true;
      const previousCheck = runResults[checkIdx - 1];
      return comparator(check.value, previousCheck.value);
    }, true);

    return {
      ok,
      message: check.message,
      runs: runResults,
    };
  }
}

export interface Result {
  ok: boolean;
  message: string;
  runs: { name: string; value: unknown }[];
}

export interface Factor {
  name: string;
  variables: Record<string, any>;
}

export type Comparator = (a: unknown, b: unknown) => boolean;

export type TestFn = (factor: Factor, compare: CompareFunc) => void;
export type ResultCb = (results: Result[]) => void;

type CompareFunc = (
  value: unknown,
  message: string,
  comparator?: Comparator
) => void;

interface RunOptions {
  immediateCheck?: (result: Result) => void;
}

export const runComparison = (
  factors: Factor[],
  testFn: TestFn,
  userOptions: Partial<RunOptions> = {}
) => {
  const defaults = {};
  const options = { ...defaults, ...userOptions };

  const runBroker = new RunBroker(factors);
  factors.forEach((factor, factorIndex) => {
    const compare: CompareFunc = (
      value: any,
      message: string,
      comp?: Comparator
    ) => {
      const comparator = comp || isEqual;
      runBroker.check(
        factorIndex,
        { value, message, comparator },
        options.immediateCheck
      );
    };

    testFn(factor, compare);
  });

  return () => runBroker.results;
};

const compareObjectsWithDates = (
  a: UnknownObject,
  b: UnknownObject,
  dateFields: FieldList = ['created', 'updated', 'date']
) => {
  const ax = extractFields(a, dateFields);
  const bx = extractFields(b, dateFields);

  // console.log('comparing static objects');
  if (!isEqual(ax.static, bx.static)) {
    return false;
  }

  // console.log(ax);
  // console.log(bx);
  return dateFields.reduce((ok, fieldName) => {
    if (!ok) return false;
    // console.log('comparing', fieldName);
    const dateAUnix = new Date(ax.fields[fieldName]).getTime();
    const dateBUnix = new Date(bx.fields[fieldName]).getTime();
    // console.log(dateAUnix, dateBUnix, Math.abs(dateAUnix - dateBUnix));
    const approxOk = approximatelyEqual(dateAUnix, dateBUnix, {
      tolerance: 10000,
    });
    // console.log('approximatelyEqual', approxOk);
    return approxOk;
  }, true);
};

type FieldList = string[];
type UnknownObject = Record<string, unknown>;

export const withDateFields =
  (dateFields: FieldList): Comparator =>
  (a: unknown, b: unknown) =>
    compareObjectsWithDates(a as UnknownObject, b as UnknownObject, dateFields);

export const ignoreFields =
  (fields: FieldList): Comparator =>
  (a: unknown, b: unknown) => {
    const ax = extractFields(a as UnknownObject, fields);
    const bx = extractFields(b as UnknownObject, fields);

    return isEqual(ax.static, bx.static);
  };

type ExtractedObject = {
  fields: Record<string, any>;
  static: Record<string, any>;
};
export const extractFields = (
  raw: UnknownObject,
  fields: FieldList
): ExtractedObject =>
  fields.reduce(
    (processed, fieldName) => {
      const { [fieldName]: fieldValue, ...rest } = processed.static;
      return {
        fields: { ...processed.fields, [fieldName]: fieldValue },
        static: rest,
      };
    },
    { fields: {}, static: raw }
  );

export const approximatelyEqual = (
  a: number,
  b: number,
  userOpts: { tolerance?: number }
) => {
  const options = {
    tolerance: 1,
    ...userOpts,
  };

  return Math.abs(a - b) <= options.tolerance;
};

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

interface Result {
  ok: boolean;
  message: string;
  runs: { name: string; value: unknown }[];
}

export interface Factor {
  name: string;
  variables: Record<string, any>;
}

export type Comparator = (a: unknown, b: unknown) => boolean;

export type TestFunc = (factor: Factor, compare: CompareFunc) => void;
export type ResultCb = (results: Result[]) => void;

type CompareFunc = (
  value: unknown,
  message: string,
  comparator?: Comparator
) => void;

export const runComparison = (
  factors: Factor[],
  testFn: TestFunc,
  resultCb: ResultCb
) => {
  const runs: Run[] = [];
  factors.forEach((factor) => {
    const run: Run = {
      name: factor.name,
      checks: [],
    };
    runs.push(run);
    const compare: CompareFunc = (
      value: any,
      message: string,
      comp?: Comparator
    ) => {
      const comparator = comp || isEqual;
      run.checks.push({ value, message, comparator });
    };
    testFn(factor, compare);
  });

  const results = calculateResults(runs);
  resultCb(results);
};

export const calculateResults = (runs: Run[]): Result[] => {
  return runs[0].checks.map((check, checkIdx) => {
    const { comparator } = check;

    const runResults = runs.map((run, runIdx) => ({
      value: run.checks[checkIdx].value,
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
  });
};

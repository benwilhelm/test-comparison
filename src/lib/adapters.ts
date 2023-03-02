/**
 * This is a generic adapter for any test framework that puts
 * describe/it into the global scope.
 */

import { Factor, CompareFunc, TestFn, runComparison, Result } from './lib';

class ResultError extends Error {
  constructor(result: Result) {
    const message = ResultError.formatMessage(result);
    super(message);
  }

  private static formatMessage(result: Result) {
    const runMessage = result.runs.map((run) =>
      [`\nResult for ${run.name}`, JSON.stringify(run.value, null, 2)].join(
        '\n'
      )
    );

    return [
      `DescribeMultiple Comparison failed for\n'${result.message}'`,
      ...runMessage,
    ].join('\n');
  }
}

const assertResultOk = (result: Result) => {
  if (!result.ok) {
    throw new ResultError(result);
  }
};

export const describeMultiple = async (factors: Factor[], testFn: TestFn) => {
  let testIndex = -1;
  let compareIndex = -1;

  // could be running in a number of test frameworks, some of which
  // use before, some of which use beforeAll.
  // @todo - come up with a better adapter mechanism
  const beforeAllHook = typeof before === 'undefined' ? beforeAll : before;

  const testFnWithDescribe: TestFn = (factor, compare) =>
    describe(factor.name, () => {
      beforeAllHook(() => {
        testIndex = -1;
      });

      beforeEach(() => {
        testIndex++;
        compareIndex = -1;
      });

      const indexingCompare: CompareFunc = (...args) => {
        compareIndex++;
        return compare(...args);
      };

      testFn(factor, indexingCompare);
    });

  runComparison(factors, testFnWithDescribe, {
    immediateCheck: assertResultOk,
    getCheckIndex: () => `${testIndex}-${compareIndex}`,
  });
};

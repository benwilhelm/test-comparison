/**
 * This is a generic adapter for any test framework that puts
 * describe/it into the global scope.
 */

import { Factor, TestFn, runComparison, Result } from '../lib';

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
  const testFnWithDescribe: TestFn = (factor, compare) =>
    describe(factor.name, () => {
      testFn(factor, compare);
    });

  runComparison(factors, testFnWithDescribe, {
    immediateCheck: assertResultOk,
  });
};

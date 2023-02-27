import { isEqual } from 'lodash';
import {
  ResultCb,
  TestFunc,
  Comparator,
  Factor,
  Run,
  calculateResults,
  runComparison,
} from './lib';

describe('runComparison()', () => {
  it('does the needful', () => {
    const { factors, testFn, resultsCb } = callbackFactory();

    runComparison(factors, testFn, resultsCb);

    expect(testFn).toHaveBeenCalledTimes(2);
    expect(testFn.mock.calls[0][0]).toBe(factors[0]);
    expect(testFn.mock.calls[1][0]).toBe(factors[1]);

    expect(resultsCb).toHaveBeenCalledTimes(1);
    expect(resultsCb).toHaveBeenCalledWith([
      {
        ok: false,
        message: 'foo comparison',
        runs: [
          { name: 'Factor 1', value: 'bar' },
          { name: 'Factor 2', value: 'bif' },
        ],
      },
      {
        ok: true,
        message: 'hard-coded',
        runs: [
          { name: 'Factor 1', value: 'x' },
          { name: 'Factor 2', value: 'x' },
        ],
      },
    ]);
  });
  it('accepts a custom comparator', () => {
    const withinOne: Comparator = (a, b) =>
      Math.abs((a as number) - (b as number)) <= 1;
    const customFactors: Factor[] = [
      { name: 'Factor 1', variables: { x: 1, y: 1 } },
      { name: 'Factor 2', variables: { x: 2, y: 3 } },
    ];
    const testFnImp: TestFunc = (factor, compare) => {
      compare(factor.variables.x, 'compare x', withinOne);
      compare(factor.variables.y, 'compare y', withinOne);
    };
    const { factors, testFn, resultsCb } = callbackFactory({
      factors: customFactors,
      testFnImp,
    });

    runComparison(factors, testFn, resultsCb);

    expect(resultsCb).toHaveBeenCalledWith([
      {
        ok: true,
        message: 'compare x',
        runs: [
          { name: 'Factor 1', value: 1 },
          { name: 'Factor 2', value: 2 },
        ],
      },
      {
        ok: false,
        message: 'compare y',
        runs: [
          { name: 'Factor 1', value: 1 },
          { name: 'Factor 2', value: 3 },
        ],
      },
    ]);
  });
});

describe('calculateResults()', () => {
  it('should transpose matrix', () => {
    const runs = runFactory();
    const results = calculateResults(runs);

    expect(results).toEqual([
      {
        ok: true,
        message: 'Comparison 1',
        runs: [
          { name: 'Run 1', value: 1 },
          { name: 'Run 2', value: 1 },
        ],
      },
      {
        ok: false,
        message: 'Comparison 2',
        runs: [
          { name: 'Run 1', value: 'foo' },
          { name: 'Run 2', value: 'bar' },
        ],
      },
      {
        ok: true,
        message: 'Comparison 3',
        runs: [
          { name: 'Run 1', value: { bif: 'baz' } },
          { name: 'Run 2', value: { bif: 'baz' } },
        ],
      },
    ]);
  });
});

type CallbackOptions = {
  factors: Factor[];
  testFnImp: TestFunc;
  resultsCbImp: ResultCb;
};
const callbackFactory = (userOptions: Partial<CallbackOptions> = {}) => {
  const defaults: CallbackOptions = {
    factors: factorFactory(),
    testFnImp: (factor, compare) => {
      compare(factor.variables.foo, 'foo comparison');
      compare('x', 'hard-coded');
    },
    resultsCbImp: (results) => {},
  };

  const options = { ...defaults, ...userOptions };
  const testFn: jest.Mock<TestFunc> = jest
    .fn()
    .mockImplementation(options.testFnImp);
  const resultsCb = jest.fn().mockImplementation(options.resultsCbImp);

  return { factors: options.factors, testFn, resultsCb };
};

const factorFactory = (): Factor[] => [
  { name: 'Factor 1', variables: { foo: 'bar' } },
  { name: 'Factor 2', variables: { foo: 'bif' } },
];

const runFactory = (): Run[] => {
  return [
    {
      name: 'Run 1',
      checks: [
        { message: 'Comparison 1', value: 1, comparator: isEqual },
        { message: 'Comparison 2', value: 'foo', comparator: isEqual },
        { message: 'Comparison 3', value: { bif: 'baz' }, comparator: isEqual },
      ],
    },

    {
      name: 'Run 2',
      checks: [
        { message: 'Comparison 1', value: 1, comparator: isEqual },
        { message: 'Comparison 2', value: 'bar', comparator: isEqual },
        { message: 'Comparison 3', value: { bif: 'baz' }, comparator: isEqual },
      ],
    },
  ];
};

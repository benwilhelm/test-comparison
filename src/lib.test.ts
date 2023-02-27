import { isEqual } from 'lodash';
import {
  ResultCb,
  TestFn,
  Comparator,
  Factor,
  Run,
  runComparison,
} from './lib';

describe('runComparison()', () => {
  it('does the needful', async () => {
    const { factors, testFn } = callbackFactory();

    const getResults = runComparison(factors, testFn);

    expect(testFn).toHaveBeenCalledTimes(2);
    expect(testFn.mock.calls[0][0]).toBe(factors[0]);
    expect(testFn.mock.calls[1][0]).toBe(factors[1]);

    expect(getResults()).toEqual([
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
  it('accepts a custom comparator', async () => {
    const withinOne: Comparator = (a, b) =>
      Math.abs((a as number) - (b as number)) <= 1;
    const customFactors: Factor[] = [
      { name: 'Factor 1', variables: { x: 1, y: 1 } },
      { name: 'Factor 2', variables: { x: 2, y: 3 } },
    ];
    const testFnImp: TestFn = (factor, compare) => {
      compare(factor.variables.x, 'compare x', withinOne);
      compare(factor.variables.y, 'compare y', withinOne);
    };
    const { factors, testFn } = callbackFactory({
      factors: customFactors,
      testFnImp,
    });

    const getResults = runComparison(factors, testFn);

    expect(getResults()).toEqual([
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
  it('accepts immediateCheck option', () => {
    const { factors, testFn } = callbackFactory({
      testFnImp: (factor, compare) => {
        compare(factor.variables.foo, 'foo');
        compare(3, 'hard-coded');
      },
    });
    const immediateCheck = jest.fn().mockImplementation((result) => {});
    runComparison(factors, testFn, {
      immediateCheck,
    });

    expect(immediateCheck).toHaveBeenCalledTimes(2);
    expect(immediateCheck.mock.calls[0][0]).toEqual({
      ok: false,
      message: 'foo',
      runs: [
        { name: 'Factor 1', value: 'bar' },
        { name: 'Factor 2', value: 'bif' },
      ],
    });
    expect(immediateCheck.mock.calls[1][0]).toEqual({
      ok: true,
      message: 'hard-coded',
      runs: [
        { name: 'Factor 1', value: 3 },
        { name: 'Factor 2', value: 3 },
      ],
    });
  });
});

type CallbackOptions = {
  factors: Factor[];
  testFnImp: TestFn;
};
const callbackFactory = (userOptions: Partial<CallbackOptions> = {}) => {
  const defaults: CallbackOptions = {
    factors: factorFactory(),
    testFnImp: (factor, compare) => {
      compare(factor.variables.foo, 'foo comparison');
      compare('x', 'hard-coded');
    },
  };

  const options = { ...defaults, ...userOptions };
  const testFn: jest.Mock<TestFn> = jest
    .fn()
    .mockImplementation(options.testFnImp);

  return { factors: options.factors, testFn };
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

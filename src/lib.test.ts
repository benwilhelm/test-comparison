import { Run, calculateResults } from './lib';

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

const runFactory = (): Run[] => {
  return [
    {
      name: 'Run 1',
      checks: [
        { message: 'Comparison 1', value: 1 },
        { message: 'Comparison 2', value: 'foo' },
        { message: 'Comparison 3', value: { bif: 'baz' } },
      ],
    },

    {
      name: 'Run 2',
      checks: [
        { message: 'Comparison 1', value: 1 },
        { message: 'Comparison 2', value: 'bar' },
        { message: 'Comparison 3', value: { bif: 'baz' } },
      ],
    },
  ];
};

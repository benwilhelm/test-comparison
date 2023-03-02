import { Comparator } from './lib';
import { describeMultiple } from './adapters';

/**
 * @todo - This isn't truly test the adapter, because it doesn't
 * test failure modes. Need to come up with a way to assert on
 * expected failures. Who tests the testers?
 */

describe('generic adapter', () => {
  const factors = [
    { name: 'Factor 1', variables: { x: 1, y: { foo: 'bar' } } },
    { name: 'Factor 2', variables: { x: 1, y: { foo: 'bar' } } },
    { name: 'Factor 3', variables: { x: 1, y: { foo: 'boffo' } } },
  ];

  describeMultiple(factors, (factor, compare) => {
    it('should have x > 0', () => {
      expect(factor.variables.x).toBeGreaterThan(0);
      compare(factor.variables.x, 'x');
    });

    it('should allow foo or bar in y', () => {
      const fooOrBar: Comparator = (a, b) =>
        //@ts-expect-error - a is of type unknown, but that's ok
        ['bar', 'boffo'].includes(a.foo) && ['bar', 'boffo'].includes(b.foo);

      compare(factor.variables.y, 'y', fooOrBar);
    });
  });
});

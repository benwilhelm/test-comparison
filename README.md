# Safely Perform Complex Refactors

`test-comparison` is a tool to enable safe, incremental refactoring of complex behaviors in your codebase. Use it to apply a set of tests simultaneously to a legacy implementation and to a refactor-in-progress. This ensures that your refactored version fulfills all the same contracts as your legacy version, and that you'll be notified if the behavior of the legacy version changes due to someone else's work while you're in the middle of your refactor.

## Usage

Basic usage is through an exported function called `describeMultiple`. It's analogous to the `describe` method which is ubiquitous in pretty much any JS-based testing framework, but it takes an additional argument which describes the two (or more) implementation cases that you want to test. Each implementation has a `name` and `variables` property, and it is passed as an object to the callback of `describeMultiple`

#### Example:

```javascript
import { describeMultiple } from 'test-comparison';

const legacyFunction = (argA, argB) => {
  /* performs some compex work, returns complex object */
};
const refactoredFunction = (argA, argB) => {
  /* same outcomes/outputs, different implementation */
};

const implementations = [
  { name: 'Legacy', variables: { functionToTest: legacyFunction } },
  { name: 'Refactored', variables: { functionToTest: refactoredFunction } },
];

describeMultiple(implementations, (implementation, compare) => {
  // This callback will be run once for each element of the
  // `implementations` array, with the implementation object
  // passed in as the first argument. The tests contained in this
  // callback will be run against each implementation in the array.

  // extract the implementated function that will be tested for this run
  const { functionToTest } = implementation.variables;

  // Create a specific assertion that describes a known outcome
  // that is desired for the implementation
  it('Assigns someValue to property1', () => {
    const result = functionToTest('foo', 'bar');
    assert.equal(result.property1, 'someValue');
  });

  // The second argument passed to describeMultiple's callback is a
  // `compare` function, which will do a deep-equal comparison between
  // the values passed to this invocation of compare for each run.
  // For more about why this is useful, see documentation below.
  it('Returns identical result across implementations', () => {
    const result = functionToTest('foo', 'bar');
    compare(result, 'comparing result between implementations');
  });
});
```

#### Test Output

```

$ npm test

Legacy
  ✔︎ Assigns someValue to property1
  ✔︎ Returns identical result across implementations

Refactored
  ✔︎ Assigns someValue to property1
  ✔︎ Returns identical result across implementations

```

const assert = require('assert');

function comparisonTest(factors, fn) {
  const runs = [];

  factors.forEach((factor) => {
    const run = {
      name: factor.name,
      comparisons: [],
    };
    runs.push(run);

    function compare(value, message, comparator) {
      run.comparisons.push({ value, message, comparator });
    }

    fn(factor, compare);
  });

  compareRuns(runs);
}

function compareRuns(runs) {
  const results = runs[0].comparisons.map((comparison, cIdx) => {
    const vals = runs.map((run) => run.comparisons[cIdx]);
    const message = comparison.message;
    const ok = vals.reduce((ok, val, valIdx) => {
      if (!ok) return false;
      if (valIdx === 0) return true;
      const previousVal = vals[valIdx - 1];
      try {
        assert.deepEqual(val, previousVal);
        return true;
      } catch (err) {
        return false;
      }
    }, true);

    return { ok, message, vals };
  });

  results.forEach((result) => {
    if (result.ok) {
      console.log(`${result.message} ok`);
    } else {
      console.log(`${result.message} NOT OK!`);
      result.vals.forEach((val, valIdx) => {
        console.log(runs[valIdx].name);
        console.log(val);
      });
    }
  });

  // runs.forEach((run, runIndex) => {
  //   // console.log(run.comparisons);
  //   if (runIndex === 0) return;
  //   run.comparisons.forEach((comparison, comparisonIndex) => {
  //     const previousRun = runs[runIndex - 1];
  //     const { value, message } = comparison;
  //     const previousValue = previousRun.comparisons[comparisonIndex].value;

  //     try {
  //       assert.deepEqual(value, previousValue, message);
  //       console.log(`${message} ok`);
  //     } catch (err) {
  //       console.error('comparison failed for ', comparison.message);
  //     }
  //   });
  // });
}

const factors = [
  {
    name: 'Case 1',
  },
  {
    name: 'Case 2',
  },
  {
    name: 'Case 3',
  },
];

comparisonTest(factors, ({ name }, compare) => {
  // console.log(name);
  compare('x', 'hard-coded');
  compare(Date.now(), 'Date.now()');
  compare({ foo: 'bar', rand: Math.random() }, 'object');
});

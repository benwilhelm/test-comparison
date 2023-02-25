import assert from 'node:assert';

interface Comparison {
  value: unknown;
  message: string;
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

export const calculateResults = (runs: Run[]): Result[] => {
  return runs[0].checks.map((check, checkIdx) => {
    const runResults = runs.map((run, runIdx) => ({
      value: run.checks[checkIdx].value,
      name: runs[runIdx].name,
    }));

    const ok = runResults.reduce((isOk, check, checkIdx) => {
      if (!isOk) return false;
      if (checkIdx === 0) return true;
      const previousCheck = runResults[checkIdx - 1];
      try {
        assert.deepEqual(check.value, previousCheck.value);
        return true;
      } catch (err) {
        return false;
      }
    }, true);

    return {
      ok,
      message: check.message,
      runs: runResults,
    };
  });
};

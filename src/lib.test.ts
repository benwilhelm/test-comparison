import { add } from './lib';

describe('lib', () => {
  it('smoke test', () => {
    expect(add(1, 2)).toEqual(4);
  });
});

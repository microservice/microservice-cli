const utils = require('../../commands/utils');

describe('utils.js', () => {
  describe('stringifyContainerOutput(data)', () => {
    test('stringifies an object', () => {
      const output = utils.stringifyContainerOutput({
        foo: 'bar',
      });

      expect(output).toBe('{\n' +
                          '  "foo": "bar"\n' +
                          '}');
    });
  });
});

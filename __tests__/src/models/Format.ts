import Format from '../../../src/models/Format';

describe('Format.ts', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Format('command', {});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'command\'',
            params: {missingProperty: 'command'},
            schemaPath: '#/required',
          }], issue: {}, text: 'commands.command.format should have required property \'command\'', valid: false,
        });
      }
    });
  });

  describe('.command', () => {
    const f = new Format('command', {
      command: ['node', 'app.js'],
    });

    expect(f.command).toEqual(['node', 'app.js']);
  });
});

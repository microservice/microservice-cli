import {Argument} from 'omg-validate';

describe('Argument.ts', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Argument('name', 'action', {});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'type\'',
            params: {missingProperty: 'type'},
            schemaPath: '#/required',
          }], issue: {}, text: 'actions.action.arguments.name should have required property \'type\'', valid: false,
        });
      }
    });

    test('throws an exception because the json is not valid', () => {
      try {
        new Argument('name', 'action', {
          type: 'bob',
        });
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '.type',
            keyword: 'pattern',
            message: 'should match pattern "^(number|int|float|string|uuid|list|map|boolean|path|object|any)$"',
            params: {pattern: '^(number|int|float|string|uuid|list|map|boolean|path|object|any)$'},
            schemaPath: '#/properties/type/pattern',
          }],
          issue: {type: 'bob'},
          text: 'actions.action.arguments.name.type should match pattern "^(number|int|float|string|uuid|list|map|boolean|path|object|any)$"',
          valid: false,
        });
      }
    });

    test('throws an exception because the json is not valid', () => {
      try {
        new Argument('name', 'action', {
          type: 'int',
          pattern: 'regex',
          enum: ['asd', 'asd'],
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument with name: `name`',
          message: 'An Argument can only have a pattern, enum, or range defined',
        });
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const a = new Argument('foo', 'action', {type: 'int'});

      expect(a.name).toBe('foo');
    });
  });

  describe('.type', () => {
    test('gets the type', () => {
      const a = new Argument('foo', 'action', {type: 'string'});

      expect(a.type).toBe('string');
    });
  });

  describe('.in', () => {
    test('gets the location of the argument', () => {
      const a = new Argument('foo', 'action', {type: 'string', in: 'requestBody'});

      expect(a.in).toBe('requestBody');
    });
  });

  describe('.help', () => {
    test('gets the help', () => {
      const a = new Argument('foo', 'action', {type: 'string', help: 'FOO!'});

      expect(a.help).toBe('FOO!');
    });
  });

  describe('.pattern', () => {
    test('gets the pattern', () => {
      const a = new Argument('foo', 'action', {type: 'string', pattern: 'w'});

      expect(a.pattern).toBe('w');
    });
  });

  describe('.enum', () => {
    test('gets the enum', () => {
      const a = new Argument('foo', 'action', {type: 'string', enum: ['bart']});

      expect(a.enum).toEqual(['bart']);
    });
  });

  describe('.range', () => {
    test('gets the range', () => {
      const a = new Argument('foo', 'action', {type: 'string', range: {min: 1, max: 10}});

      expect(a.range).toEqual({min: 1, max: 10});
    });
  });

  describe('.isRequired()', () => {
    test('checks if it is required', () => {
      const a1 = new Argument('foo', 'action', {type: 'string'});
      const a2 = new Argument('foo', 'action', {type: 'string', required: true});

      expect(a1.isRequired()).toBeFalsy();
      expect(a2.isRequired()).toBeTruthy();
    });
  });

  describe('.default', () => {
    test('gets the default', () => {
      const a = new Argument('foo', 'action', {type: 'string', default: 'mom'});

      expect(a.default).toBe('mom');
    });
  });
});

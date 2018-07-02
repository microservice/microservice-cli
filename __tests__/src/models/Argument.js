const Argument = require('../../../src/models/Argument');

describe('Argument.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Argument('name', {});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'type\'',
            params: {missingProperty: 'type'},
            schemaPath: '#/required',
          }], valid: false, issue: {},
        });
      }
    });

    test('throws an exception because the json is not valid', () => {
      try {
        new Argument('name', {
          type: 'bob',
        });
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '.type',
            keyword: 'pattern',
            message: 'should match pattern "^(int|float|string|uuid|list|object|boolean|path)$"',
            params: {pattern: '^(int|float|string|uuid|list|object|boolean|path)$'},
            schemaPath: '#/properties/type/pattern',
          }], valid: false, issue: {type: 'bob'},
        });
      }
    });

    test('throws an exception because the json is not valid', () => {
      try {
        new Argument('name', {
          type: 'int',
          pattern: 'regex',
          enum: ['asd', 'asd'],
        });
      } catch (e) {
        expect(e).toEqual({
          'context': 'Argument with name: `name`',
          'message': 'An Argument can only have a pattern, enum, or range defined',
        });
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const a = new Argument('foo', {type: 'int'});

      expect(a.name).toBe('foo');
    });
  });

  describe('.type', () => {
    test('gets the type', () => {
      const a = new Argument('foo', {type: 'string'});

      expect(a.type).toBe('string');
    });
  });

  describe('.location', () => {
    test('gets the location', () => {
      const a = new Argument('foo', {type: 'string', location: 'body'});

      expect(a.location).toBe('body');
    });
  });

  describe('.help', () => {
    test('gets the help', () => {
      const a = new Argument('foo', {type: 'string', help: 'FOO!'});

      expect(a.help).toBe('FOO!');
    });
  });

  describe('.pattern', () => {
    test('gets the pattern', () => {
      const a = new Argument('foo', {type: 'string', pattern: 'w'});

      expect(a.pattern).toBe('w');
    });
  });

  describe('.enum', () => {
    test('gets the enum', () => {
      const a = new Argument('foo', {type: 'string', enum: ['bart']});

      expect(a.enum).toEqual(['bart']);
    });
  });

  describe('.enum', () => {
    test('gets the enum', () => {
      const a = new Argument('foo', {type: 'string', enum: ['bart']});

      expect(a.enum).toEqual(['bart']);
    });
  });

  describe('.range', () => {
    test('gets the range', () => {
      const a = new Argument('foo', {type: 'string', range: {min: 1, max: 10}});

      expect(a.range).toEqual({min: 1, max: 10});
    });
  });

  describe('.isRequired()', () => {
    test('checks if it is required', () => {
      const a1 = new Argument('foo', {type: 'string'});
      const a2 = new Argument('foo', {type: 'string', required: true});

      expect(a1.isRequired()).toBeFalsy();
      expect(a2.isRequired()).toBeTruthy();
    });
  });

  describe('.default', () => {
    test('gets the default', () => {
      const a = new Argument('foo', {type: 'string', default: 'mom'});

      expect(a.default).toBe('mom');
    });
  });
});

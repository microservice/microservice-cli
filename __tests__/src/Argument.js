const Argument = require('../../src/Argument');

describe('Argument.js', () => {
  describe('constructor', () => {
    test('throws an exception because no type is given', () => {
      try {
        new Argument('name', {});
      } catch (e) {
        expect(e).toEqual({
          'context': 'Argument with name: `name`',
          'message': 'An Argument must be provided a type',
        });
      }
    });

    test('throws an exception because the type is not one of `int,float,string,uuid,list,map,boolean,path`', () => {
      try {
        new Argument('name', {
          type: 'bob',
        });
      } catch (e) {
        expect(e).toEqual({
          'context': 'Argument with name: `name`',
          'message': 'The Argument type must be one of `int,float,string,uuid,list,map,boolean,path`',
        });
      }
    });

    test('throws an exception because more then one check is defined `pattern,enum,range`', () => {
      try {
        new Argument('name', {
          type: 'int',
          pattern: 'regex',
          enum: ['asd', 'asd'],
        });
      } catch (e) {
        expect(e).toEqual({
          'context': 'Argument with name: `name`',
          'message': 'An Argument can only have a patter, enum, or range defined',
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

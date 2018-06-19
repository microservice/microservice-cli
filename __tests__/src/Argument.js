const Argument = require('../../src/Argument');

describe('Argument.js', () => {
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
});

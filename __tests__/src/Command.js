const Command = require('../../src/Command');
const Argument = require('../../src/Argument');
const Http = require('../../src/Http');

describe('Command.js', () => {
  describe('constructor', () => {
    test('throws an exception because no output is given', () => {
      try {
        new Command('name', {});
      } catch (e) {
        expect(e).toBe('A Command must be provided an output object');
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const c = new Command('foo', {output: {type: 'string'}});

      expect(c.name).toBe('foo');
    });
  });

  describe('.output', () => {
    test('gets the output', () => {
      const c = new Command('foo', {output: {type: 'string'}});

      expect(c.output).toEqual({type: 'string'});
    });
  });

  describe('.help', () => {
    test('gets the help', () => {
      const c = new Command('foo', {output: {type: 'string'}, help: 'FOO ME'});

      expect(c.help).toBe('FOO ME');
    });
  });

  describe('.areRequiredArgumentsSupplied(_arguments)', () => {
    test('returns true because all required arguments are supplied', () => {
      const c = new Command('foo', {
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            required: true,
          },
        },
      });

      expect(c.areRequiredArgumentsSupplied({
        bar: 1,
      })).toBeTruthy();
    });

    test('returns false because required argument(s) are not supplied', () => {
      const c = new Command('foo', {
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            required: true,
          },
        },
      });

      expect(c.areRequiredArgumentsSupplied({
        foo: 1,
      })).toBeFalsy();
    });
  });

  describe('.arguments', () => {
    test('get the arguments', () => {
      const c1 = new Command('foo', {
        output: {
          type: 'string',
        },
      });
      const c2 = new Command('foo', {
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            required: true,
          },
        },
      });

      expect(c1.arguments).toEqual([]);
      expect(c2.arguments).toEqual([new Argument('bar', {
        type: 'int',
        required: true,
      })]);
    });
  });

  describe('.getArgument(argument)', () => {
    test('gets the argument', () => {
      const c = new Command('foo', {
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            required: true,
          },
        },
      });

      expect(c.getArgument('bar')).toEqual(new Argument('bar', {
        type: 'int',
        required: true,
      }));
    });

    test('throws an error because the argument does not exist', () => {
      const c = new Command('foo', {
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            required: true,
          },
        },
      });

      try {
        c.getArgument('argo');
      } catch (e) {
        expect(e).toBe('Argument does not exist');
      }
    });
  });

  describe('.http', () => {
    test('get the http', () => {
      const c = new Command('foo', {
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            location: 'body',
            required: true,
          },
        },
        http: {
          method: 'post',
          endpoint: '/skrt',
        },
      });

      expect(c.http).toEqual(new Http({
        method: 'post',
        endpoint: '/skrt',
      }));
    });
  });

  describe('.run', () => {
    test('gets run', () => {
      const c = new Command('foo', {
        output: {
          type: 'string',
        },
        run: {
          command: ['node', 'cli.js', 'command'],
          port: 5000,
        },
      });

      expect(c.run).toEqual({
        'args': 'cli.js command ',
        'command': 'node',
        'port': 5000,
      });
    });
  });
});

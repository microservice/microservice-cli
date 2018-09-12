const Command = require('../../../src/models/Action');
const Argument = require('../../../src/models/Argument');
const Http = require('../../../src/models/Http');

describe('Command.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Command('name', {});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'output\'',
            params: {missingProperty: 'output'},
            schemaPath: '#/required',
          }], issue: {}, text: 'commands.name should have required property \'output\'', valid: false,
        });
      }
    });

    test('throws an exception because a run and http interface are defined', () => {
      try {
        new Command('name', {
          output: {
            type: 'int',
          },
          http: {
            method: 'post',
            endpoint: '/send',
          },
          run: {
            command: ['node', 'sever.js'],
            port: 5555,
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Command with name: `name`',
          message: 'A Command can only interface with exec, an http command, or a run command',
        });
      }
    });

    test('throws an exception because an http command\'s argument does not provide a location', () => {
      try {
        new Command('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            endpoint: '/data',
          },
          arguments: {
            foo: {
              type: 'string',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for command: `name`',
          message: 'Commands\' arguments that interface via http must provide a location',
        });
      }
    });

    test('throws an exception because an http command\'s path argument is not defined in the endpoint for the http call', () => {
      try {
        new Command('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            endpoint: '/data',
          },
          arguments: {
            foo: {
              type: 'string',
              location: 'path',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for command: `name`',
          message: 'Path parameters must be defined in the http endpoint, of the form `{{argument}}`',
        });
      }
    });

    test('throws an exception because an http command\'s path argument is not marked required or given a default value', () => {
      try {
        new Command('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            endpoint: '/data/{{foo}}',
          },
          arguments: {
            foo: {
              type: 'string',
              location: 'path',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for command: `name`',
          message: 'Path parameters must be marked as required or be provided a default variable',
        });
      }
    });

    test('throws an exception because an http command has path parameters in endpoint that aren\'t defined as arguments', () => {
      try {
        new Command('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            endpoint: '/data/{{foo}}/{{bar}}',
          },
          arguments: {
            foo: {
              type: 'string',
              required: true,
              location: 'path',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Path parameter(s): `{{bar}}` for command: `name`',
          message: 'If a url specifies a path parameter i.e. `{{argument}}`, the argument must be defined in the command',
        });
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
        expect(e).toBe('Argument `argo` does not exist');
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

      expect(c.http).toEqual(new Http('foo', {
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
        args: 'cli.js command ',
        command: 'node',
        port: 5000,
      });
    });
  });
});

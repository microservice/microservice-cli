const Argument = require('../../../src/models/Argument');
const Event = require('../../../src/models/Event');
const Http = require('../../../src/models/Http');

describe('Event.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Event('name', {});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'http\'',
            params: {missingProperty: 'http'},
            schemaPath: '#/required',
          }], issue: {}, text: 'actions.events.name should have required property \'http\'', valid: false,
        });
      }
    });

    test('throws an exception because an http action\'s argument does not provide a location for the arguments', () => {
      try {
        new Event('name', {
          http: {
            subscribe: {
              method: 'post',
              port: 5000,
              path: '/sub',
            },
            unsubscribe: {
              method: 'post',
              port: 5000,
              path: '/unsub',
            },
          },
          arguments: {
            foo: {
              type: 'string',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for event: `name`',
          message: 'Events\' arguments that interface via http must provide an in',
        });
      }
    });

    test('throws an exception because an http action\'s path argument is not defined in the endpoint for the http call', () => {
      try {
        new Event('name', {
          http: {
            subscribe: {
              method: 'post',
              port: 5000,
              path: '/sub',
            },
            unsubscribe: {
              method: 'post',
              port: 5000,
              path: '/unsub',
            },
          },
          arguments: {
            foo: {
              type: 'string',
              in: 'path',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for event: `name`',
          message: 'Path parameters must be defined in the http path, of the form `{{argument}}`',
        });
      }
    });

    test('throws an exception because an http action\'s path argument is not marked required or given a default value', () => {
      try {
        new Event('name', {
          http: {
            subscribe: {
              method: 'post',
              port: 5000,
              path: '/sub/{{foo}}',
            },
            unsubscribe: {
              method: 'post',
              port: 5000,
              path: '/unsub/{{foo}}',
            },
          },
          arguments: {
            foo: {
              type: 'string',
              in: 'path',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for event: `name`',
          message: 'Path parameters must be marked as required or be provided a default variable',
        });
      }
    });

    test('throws an exception because an http action has path parameters in endpoint that aren\'t defined as arguments', () => {
      try {
        new Event('name', {
          http: {
            subscribe: {
              method: 'post',
              port: 5000,
              path: '/sub/{{foo}}/{{bar}}',
            },
            unsubscribe: {
              method: 'post',
              port: 5000,
              path: '/unsub/{{foo}}',
            },
          },
          arguments: {
            foo: {
              type: 'string',
              required: true,
              in: 'path',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Path parameter(s): `{{bar}}` for event: `name`',
          message: 'If a url specifies a path parameter i.e. `{{argument}}`, the argument must be defined in the event',
        });
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const e = new Event('foo', {
        http: {
          port: 5000,
          subscribe: {path: '/sub', method: 'post'},
          unsubscribe: {path: '/unsub', method: 'post'},
        },
      });

      expect(e.name).toBe('foo');
    });
  });

  describe('.help', () => {
    test('gets the help', () => {
      const e = new Event('foo', {
        http: {
          port: 5000,
          subscribe: {path: '/sub', method: 'post'},
          unsubscribe: {path: '/unsub', method: 'post'},
        }, help: 'FOO ME',
      });

      expect(e.help).toBe('FOO ME');
    });
  });

  describe('.areRequiredArgumentsSupplied(_arguments)', () => {
    test('returns true because all required arguments are supplied', () => {
      const e = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
        help: 'FOO ME',
      });

      expect(e.areRequiredArgumentsSupplied({
        bar: 1,
      })).toBeTruthy();
    });

    test('returns false because required argument(s) are not supplied', () => {
      const e = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });

      expect(e.areRequiredArgumentsSupplied({
        foo: 1,
      })).toBeFalsy();
    });
  });

  describe('.arguments', () => {
    test('get the arguments', () => {
      const e1 = new Event('foo', {
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });
      const e2 = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });

      expect(e1.arguments).toEqual([]);
      expect(e2.arguments).toEqual([new Argument('bar', {
        type: 'int',
        required: true,
        in: 'requestBody',
      })]);
    });
  });

  describe('.getArgument(argument)', () => {
    test('gets the argument', () => {
      const e = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });

      expect(e.getArgument('bar')).toEqual(new Argument('bar', {
        type: 'int',
        required: true,
        in: 'requestBody',
      }));
    });

    test('throws an error because the argument does not exist', () => {
      const e = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });

      try {
        e.getArgument('argo');
      } catch (e) {
        expect(e).toBe('Argument `argo` does not exist');
      }
    });
  });

  describe('.subscribe', () => {
    test('get the subscribe', () => {
      const e = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });

      expect(e.subscribe).toEqual(new Http('foo', {
        method: 'post',
        port: 5000,
        path: '/sub',
      }));
    });
  });

  describe('.unsubscribe', () => {
    test('get the unsubscribe', () => {
      const e = new Event('foo', {
        arguments: {
          bar: {
            type: 'int',
            required: true,
            in: 'requestBody',
          },
        },
        http: {
          port: 5000,
          subscribe: {
            path: '/sub', method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      });

      expect(e.unsubscribe).toEqual(new Http('foo', {
        method: 'post',
        port: 5000,
        path: '/unsub',
      }));
    });
  });
});

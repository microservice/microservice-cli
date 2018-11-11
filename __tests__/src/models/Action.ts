import Action from '../../../src/models/Action';
import Argument from '../../../src/models/Argument';
import Event from '../../../src/models/Event';
import Http from '../../../src/models/Http';

describe('Action.ts', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Action('name', {});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'http\'',
            params: {missingProperty: 'http'},
            schemaPath: '#/oneOf/0/required',
          }, {
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'format\'',
            params: {missingProperty: 'format'},
            schemaPath: '#/oneOf/1/required',
          }, {
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'rpc\'',
            params: {missingProperty: 'rpc'},
            schemaPath: '#/oneOf/2/required',
          }, {
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'events\'',
            params: {missingProperty: 'events'},
            schemaPath: '#/oneOf/3/required',
          }, {
            dataPath: '',
            keyword: 'oneOf',
            message: 'should match exactly one schema in oneOf',
            params: {passingSchemas: null},
            schemaPath: '#/oneOf',
          }],
          issue: {},
          text: 'actions.name should have required property \'http\', actions.name should have required property \'format\', actions.name should have required property \'rpc\', actions.name should have required property \'events\', actions.name should match exactly one schema in oneOf',
          valid: false,
        });
      }
    });

    test('throws an exception because an http action\'s argument does not provide a location for the arguments', () => {
      try {
        new Action('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            port: 5000,
            path: '/data',
          },
          arguments: {
            foo: {
              type: 'string',
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Argument: `foo` for action: `name`',
          message: 'Actions\' arguments that interface via http must provide an in',
        });
      }
    });

    test('throws an exception because an http action\'s path argument is not defined in the endpoint for the http call', () => {
      try {
        new Action('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            port: 5000,
            path: '/data',
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
          context: 'Argument: `foo` for action: `name`',
          message: 'Path parameters must be defined in the http path, of the form `{{argument}}`',
        });
      }
    });

    test('throws an exception because an http action\'s path argument is not marked required or given a default value', () => {
      try {
        new Action('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            port: 5000,
            path: '/data/{{foo}}',
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
          context: 'Argument: `foo` for action: `name`',
          message: 'Path parameters must be marked as required or be provided a default variable',
        });
      }
    });

    test('throws an exception because an http action has path parameters in endpoint that aren\'t defined as arguments', () => {
      try {
        new Action('name', {
          output: {type: 'map'},
          http: {
            method: 'post',
            port: 5000,
            path: '/data/{{foo}}/{{bar}}',
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
          context: 'Path parameter(s): `{{bar}}` for action: `name`',
          message: 'If a url specifies a path parameter i.e. `{{argument}}`, the argument must be defined in the action',
        });
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const a = new Action('foo', {format: {command: 'foo.sh'}, output: {type: 'string'}});

      expect(a.name).toBe('foo');
    });
  });

  describe('.output', () => {
    test('gets the output', () => {
      const a = new Action('foo', {format: {command: 'foo.sh'}, output: {type: 'string'}});

      expect(a.output).toEqual({type: 'string'});
    });
  });

  describe('.help', () => {
    test('gets the help', () => {
      const a = new Action('foo', {format: {command: 'foo.sh'}, output: {type: 'string'}, help: 'FOO ME'});

      expect(a.help).toBe('FOO ME');
    });
  });

  describe('.areRequiredArgumentsSupplied(_arguments)', () => {
    test('returns true because all required arguments are supplied', () => {
      const a = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
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

      expect(a.areRequiredArgumentsSupplied({
        bar: 1,
      })).toBeTruthy();
    });

    test('returns false because required argument(s) are not supplied', () => {
      const a = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
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

      expect(a.areRequiredArgumentsSupplied({
        foo: 1,
      })).toBeFalsy();
    });
  });

  describe('.arguments', () => {
    test('get the arguments', () => {
      const c1 = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
        output: {
          type: 'string',
        },
      });
      const c2 = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
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
      expect(c2.arguments).toEqual([new Argument('bar', 'foo', {
        type: 'int',
        required: true,
      })]);
    });
  });

  describe('.getArgument(argument)', () => {
    test('gets the argument', () => {
      const a = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
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

      expect(a.getArgument('bar')).toEqual(new Argument('bar', 'foo', {
        type: 'int',
        required: true,
      }));
    });

    test('throws an error because the argument does not exist', () => {
      const a = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
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
        a.getArgument('argo');
      } catch (e) {
        expect(e).toBe('Argument `argo` does not exist');
      }
    });
  });

  describe('.events', () => {
    describe('returns null because this action does not have any events', () => {
      const a = new Action('foo', {
        format: {
          command: 'foo.sh',
        },
      });

      expect(a.events).toBe(null);
    });

    describe('get the action\'s events', () => {
      const a = new Action('foo', {
        events: {
          foo: {
            http: {
              port: 5000,
              subscribe: {
                path: '/sub',
                method: 'post',
              },
              unsubscribe: {
                path: '/unsub',
                method: 'post',
              },
            },
          },
        },
      });

      expect(a.events).toEqual([new Event('foo', 'foo', {
        http: {
          port: 5000,
          subscribe: {
            path: '/sub',
            method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      })]);
    });
  });

  describe('.getEvent(event)', () => {
    test('throws and exception because the event does not exist', () => {
      try {
        new Action('foo', {
          format: {
            command: 'foo.sh',
          },
        }).getEvent('foo');
      } catch (e) {
        expect(e).toBe('Event `foo` does not exist');
      }
    });

    test('gets the event', () => {
      const a = new Action('foo', {
        events: {
          foo: {
            http: {
              port: 5000,
              subscribe: {
                path: '/sub',
                method: 'post',
              },
              unsubscribe: {
                path: '/unsub',
                method: 'post',
              },
            },
          },
        },
      });

      expect(a.getEvent('foo')).toEqual(new Event('foo', 'foo', {
        http: {
          port: 5000,
          subscribe: {
            path: '/sub',
            method: 'post',
          },
          unsubscribe: {
            path: '/unsub',
            method: 'post',
          },
        },
      }));
    });
  });

  describe('.http', () => {
    test('get the http', () => {
      const a = new Action('foo', {
        http: {
          method: 'post',
          port: 5000,
          path: '/skrt',
        },
        output: {
          type: 'string',
        },
        arguments: {
          bar: {
            type: 'int',
            in: 'requestBody',
            required: true,
          },
        },
      });

      expect(a.http).toEqual(new Http('foo', {
        method: 'post',
        port: 5000,
        path: '/skrt',
      }, 'actions.actionName.http'));
    });
  });
});

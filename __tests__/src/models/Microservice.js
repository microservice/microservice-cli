const Microservice = require('../../../src/models/Microservice');
const Action = require('../../../src/models/Action');
const EnvironmentVariable = require('../../../src/models/EnvironmentVariable');
const Volume = require('../../../src/models/Volume');
const Lifecycle = require('../../../src/models/Lifecycle');

describe('Microservice.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Microservice({
          omg: 1,
        });
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'minProperties',
            message: 'should NOT have less than 1 properties',
            params: {limit: 1},
            schemaPath: '#/minProperties',
          }], issue: {}, text: 'data should NOT have less than 1 properties', valid: false,
        });
      }
    });

    test('throws an exception because a command interfaces via http and a lifecycle is not provided', () => {
      try {
        new Microservice({
          omg: 1,
          actions: {
            foo: {
              output: {type: 'map'},
              http: {
                method: 'post',
                port: 5000,
                path: '/data',
              },
            },
          },
        });
      } catch (e) {
        expect(e).toEqual({
          context: 'Action with name: `foo`',
          message: 'If an action interfaces with http then a lifecycle must be provided',
        });
      }
    });
  });

  describe('.rawData', () => {
    test('gets the raw data after validation', () => {
      const m = new Microservice({
        omg: 1,
        actions: {
          foo: {
            format: {
              command: 'foo.sh',
            },
            output: {
              type: 'boolean',
            },
          },
        },
      });

      expect(m.rawData).toEqual({
        errors: null,
        text: 'No errors',
        valid: true,
        yaml: {actions: {foo: {format: {command: 'foo.sh'}, output: {type: 'boolean'}}}, omg: 1},
      });
    });
  });

  describe('.commands', () => {
    test('gets the empty command list', () => {
      const m = new Microservice({
        omg: 1,
      });

      expect(m.actions).toEqual([]);
    });

    test('gets the command list', () => {
      const m = new Microservice({
        omg: 1,
        actions: {
          foo: {
            format: {
              command: 'foo.sh',
            },
            output: {type: 'boolean'},
          },
          bar: {
            format: {
              command: 'bar.sh',
            },
            output: {type: 'int'},
          },
        },
      });

      expect(m.actions).toEqual([new Action('foo', {format: {command: 'foo.sh'}, output: {type: 'boolean'}}), new Action('bar', {format: {command: 'bar.sh'}, output: {type: 'int'}})]);
    });
  });

  describe('.getCommand(command)', () => {
    const m = new Microservice({
      omg: 1,
      actions: {
        foo: {
          format: {
            command: 'foo.sh',
          },
          output: {type: 'list'},
        },
      },
    });
    test('throws and exception because the command does not exist', () => {
      try {
        m.getAction('bar');
      } catch (e) {
        expect(e).toEqual({message: 'Action: `bar` does not exist'});
      }
    });

    test('gets the command', () => {
      expect(m.getAction('foo')).toEqual(new Action('foo', {format: {command: 'foo.sh'}, output: {type: 'list'}}));
    });
  });

  describe('.environmentVariables', () => {
    test('gets the empty environment variable list', () => {
      const m = new Microservice({
        omg: 1,
      });

      expect(m.environmentVariables).toEqual([]);
    });

    test('gets the environment variable list', () => {
      const m = new Microservice({
        omg: 1,
        environment: {
          foo: {
            type: 'boolean',
          },
          bar: {
            type: 'string',
          },
        },
      });

      expect(m.environmentVariables).toEqual([new EnvironmentVariable('foo', {type: 'boolean'}), new EnvironmentVariable('bar', {type: 'string'})]);
    });
  });

  describe('.areRequiredEnvironmentVariablesSupplied(environmentVariableMapping)', () => {
    const m = new Microservice({
      omg: 1,
      environment: {
        foo: {
          type: 'boolean',
          required: true,
        },
        bar: {
          type: 'string',
        },
      },
    });
    test('returns true because all required environment variables are supplied', () => {
      expect(m.areRequiredEnvironmentVariablesSupplied({
        foo: false,
      })).toBeTruthy();
    });

    test('returns false because not all required environment variables are supplied', () => {
      expect(m.areRequiredEnvironmentVariablesSupplied({})).toBeFalsy();
    });
  });

  describe('.requiredEnvironmentVariables', () => {
    test('gets the list of required environment variables', () => {
      const m = new Microservice({
        omg: 1,
        environment: {
          foo: {
            type: 'boolean',
            required: true,
          },
          bar: {
            type: 'string',
          },
        },
      });

      expect(m.requiredEnvironmentVariables).toEqual(['foo']);
    });
  });

  describe('.volumes', () => {
    test('gets the empty volume list', () => {
      const m = new Microservice({
        omg: 1,
      });

      expect(m.volumes).toEqual([]);
    });

    test('gets the volume list', () => {
      const m = new Microservice({
        omg: 1,
        volumes: {
          foo: {
            target: '/foo',
          },
          bar: {
            target: '/bar',
            persist: true,
          },
        },
      });

      expect(m.volumes).toEqual([new Volume('foo', {target: '/foo'}), new Volume('bar', {
        target: '/bar',
        persist: true,
      })]);
    });
  });

  describe('.getVolume(volume)', () => {
    const m = new Microservice({
      omg: 1,
      volumes: {
        foo: {
          target: '/foo',
        },
      },
    });
    test('throws and exception because the volume does not exist', () => {
      try {
        m.getVolume('bar');
      } catch (e) {
        expect(e).toEqual({message: 'Volume: `bar` does not exist'});
      }
    });

    test('gets the volume', () => {
      expect(m.getVolume('foo')).toEqual(new Volume('foo', {target: '/foo'}));
    });
  });

  describe('.lifecycle', () => {
    test('gets the lifecycle', () => {
      const m = new Microservice({
        omg: 1,
        lifecycle: {
          startup: {
            command: ['node', 'app.js', 'foo'],
          },
        },
      });

      expect(m.lifecycle).toEqual(new Lifecycle({
        startup: {
          command: ['node', 'app.js', 'foo'],
        },
      }));
    });
  });
});

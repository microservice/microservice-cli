import * as sinon from 'sinon';
import FormatExec from '../../../../src/commands/exec/FormatExec';
import Microservice from '../../../../src/models/Microservice';
import * as utils from '../../../../src/utils';

describe('FormatExec.ts', () => {
  let execStub;

  beforeEach(() => {
    execStub = sinon.stub(utils, 'exec').callsFake(async () => '`execStub`');
    sinon.stub(utils, 'getOpenPort').callsFake(async () => 5555);
  });

  afterEach(() => {
    (utils.exec as any).restore();
    (utils.getOpenPort as any).restore();
  });

  describe('.startService()', () => {
    test('starts service with dev null default', async () => {
      const containerID = await new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
      }), {}, {}).startService();
      expect(containerID).toBe('`execStub`');
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id tail -f /dev/null'],
      ]);
    });

    test('starts service with lifecycle', async () => {
      const containerID = await new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
        lifecycle: {
          startup: {
            command: ['node', 'start.js'],
          },
        },
      }), {}, {}).startService();
      expect(containerID).toBe('`execStub`');
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id node start.js'],
      ]);
    });
  });

  describe('.isRunning()', () => {
    test('not running', async () => {
      (utils.exec as any).restore();
      execStub = sinon.stub(utils, 'exec').callsFake(async () => '[{"State":{"Running":false}}]');

      expect(await new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
        lifecycle: {
          startup: {
            command: ['node', 'start.js'],
          },
        },
      }), {}, {}).isRunning()).toBeFalsy();
    });

    test('running', async () => {
      (utils.exec as any).restore();
      execStub = sinon.stub(utils, 'exec').callsFake(async () => '[{"State":{"Running":true}}]');

      expect(await new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
        lifecycle: {
          startup: {
            command: ['node', 'start.js'],
          },
        },
      }), {}, {}).isRunning()).toBeTruthy();
    });
  });

  describe('.exec(action)', () => {
    test('throws an exception because not all required arguments are supplied', async () => {
      try {
        await new FormatExec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            tom: {
              format: {
                command: 'tom.sh',
              },
              arguments: {
                foo: {
                  type: 'string',
                  required: true,
                },
              },
            },
          },
        }), {}, {}).exec('tom');
      } catch (e) {
        expect(e.message).toBe('Failed action: `tom`. Need to supply required arguments: `foo`');
      }
    });

    test('throws an exception because not all required environment variables are supplied', async () => {
      try {
        await new FormatExec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            tom: {
              format: {
                command: 'tom.sh',
              },
              arguments: {
                foo: {
                  type: 'float',
                  required: true,
                },
              },
            },
          },
          environment: {
            TOKEN: {
              type: 'string',
              required: true,
            },
          },
        }), {
          foo: '1.1',
        }, {}).exec('tom');
      } catch (e) {
        expect(e.message).toBe('Failed action: `tom`. Need to supply required environment variables: `TOKEN`');
      }
    });

    test('runs the command', async () => {
      const formatExec = new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
      }), {}, {});
      await formatExec.startService();

      await formatExec.exec('test');
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id tail -f /dev/null'],
        ['docker exec `execStub` test.sh'],
      ]);
    });

    test('runs an exec command and fills in default environment variables and arguments', async () => {
      const formatExec = new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          steve: {
            format: {
              command: 'steve.sh',
            },
            output: {type: 'string'},
            arguments: {
              foo: {
                type: 'int',
                default: 3,
              },
              bar: {
                type: 'map',
                default: {
                  foo: 'bar',
                },
              },
            },
          },
        },
        environment: {
          BOB_TOKEN: {
            type: 'string',
            default: 'BOBBY',
          },
        },
      }), {}, {});
      await formatExec.startService();

      await formatExec.exec('steve');
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id tail -f /dev/null'],
        ['docker exec `execStub` steve.sh \'{"foo":3,"bar":{"foo":"bar"}}\''],
      ]);
    });
  });

  describe('.stopService()', () => {
    test('stops the service', async () => {
      const formatExec = new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
      }), {}, {});
      await formatExec.startService();
      await formatExec.exec('test');

      await formatExec.stopService();
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id tail -f /dev/null'],
        ['docker exec `execStub` test.sh'],
        ['docker kill `execStub`'],
      ]);
    });
  });
});

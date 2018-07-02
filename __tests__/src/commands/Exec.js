const sinon = require('sinon');
const ora = require('../../../src/ora');
const Exec = require('../../../src/commands/Exec');
const Microservice = require('../../../src/models/Microservice');
const utils = require('../../../src/utils');

describe('Exec.js', () => {
  let successText = '';
  let execStub;

  beforeEach(() => {
    execStub = sinon.stub(utils, 'exec').callsFake(async () => 'data');
    sinon.stub(ora, 'start').callsFake(() => {
      return {
        succeed: (text) => {
          successText = text;
        },
      };
    });
  });

  afterEach(() => {
    utils.exec.restore();
    ora.start.restore();
    successText = '';
  });

  describe('.go(command)', () => {
    test('throws an exception because not all required arguments are supplied', async () => {
      try {
        await new Exec('fake_docker_id', new Microservice({
          commands: {
            tom: {
              output: {type: 'string'},
              arguments: {
                foo: {
                  type: 'float',
                  required: true,
                },
              },
            },
          },
        }), {}, {}).go('tom');
      } catch (e) {
        expect(e.message).toBe('Failed command: `tom`. Need to supply required arguments: `foo`');
      }
    });

    test('throws an exception because not all required environment variables are supplied', async () => {
      try {
        await new Exec('fake_docker_id', new Microservice({
          commands: {
            tom: {
              output: {type: 'string'},
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
        }, {}).go('tom');
      } catch (e) {
        expect(e.message).toBe('Failed command: `tom`. Need to supply required environment variables: `TOKEN`');
      }
    });

    test('runs an exec command', async () => {
      await new Exec('fake_docker_id', new Microservice({
        commands: {
          test: {
            output: {type: 'string'},
          },
        },
      }), {}, {}).go('test');
      expect(successText).toBe('Ran command: `test` with output: data');
      expect(execStub.calledWith('docker run fake_docker_id test')).toBeTruthy();
    });

    test('runs an entrypoint', async () => {
      await new Exec('fake_docker_id', new Microservice({
        commands: {
          entrypoint: {
            output: {type: 'string'},
            arguments: {
              foo: {
                type: 'int',
                required: true,
              },
              bar: {
                type: 'string',
              },
            },
          },
        },
        environment: {
          BOB_TOKEN: {
            type: 'string',
            required: true,
          },
        },
      }), {
        foo: '2',
      }, {
        BOB_TOKEN: 'BOB',
      }).go('entrypoint');
      expect(successText).toBe('Ran command: `entrypoint` with output: data');
      expect(execStub.calledWith('docker run -e BOB_TOKEN="BOB" fake_docker_id \'{"foo":2}\'')).toBeTruthy();
    });

    test('runs an exec command and fills in default environment variables and arguments', async () => {
      await new Exec('fake_docker_id', new Microservice({
        commands: {
          steve: {
            output: {type: 'string'},
            arguments: {
              foo: {
                type: 'int',
                default: 3,
              },
              bar: {
                type: 'string',
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
      }), {}, {}).go('steve');
      expect(successText).toBe('Ran command: `steve` with output: data');
      expect(execStub.calledWith('docker run -e BOB_TOKEN="BOBBY" fake_docker_id steve \'{"foo":3}\'')).toBeTruthy();
    });
  });
});

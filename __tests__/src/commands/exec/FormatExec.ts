import * as sinon from 'sinon';
import ora from '../../../../src/ora';
import FormatExec from '../../../../src/commands/exec/FormatExec';
import Microservice from '../../../../src/models/Microservice';
import * as utils from '../../../../src/utils';

describe('FormatExec.ts', () => {
  let successTextList = [];
  let execStub;

  beforeEach(() => {
    execStub = sinon.stub(utils, 'exec').callsFake(async () => '`execStub`');
    sinon.stub(ora, 'start').callsFake(() => {
      return {
        succeed: (text) => {
          successTextList.push(text);
        },
      };
    });
    sinon.stub(utils, 'getOpenPort').callsFake(async () => 5555);
  });

  afterEach(() => {
    (utils.exec as any).restore();
    (ora.start as any).restore();
    (utils.getOpenPort as any).restore();
    successTextList = [];
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
      await new FormatExec('fake_docker_id', new Microservice({
        omg: 1,
        actions: {
          test: {
            format: {
              command: 'test.sh',
            },
            output: {type: 'string'},
          },
        },
      }), {}, {}).exec('test');

      expect(successTextList).toEqual(['Ran action: `test` with output: `execStub`']);
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id tail -f /dev/null'],
        ['docker exec `execStub` test.sh'],
        ['docker kill `execStub`'],
      ]);
    });

    test('runs an exec command and fills in default environment variables and arguments', async () => {
      await new FormatExec('fake_docker_id', new Microservice({
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
      }), {}, {}).exec('steve');

      expect(successTextList).toEqual(['Ran action: `steve` with output: `execStub`']);
      expect(execStub.args).toEqual([
        ['docker run -td fake_docker_id tail -f /dev/null'],
        ['docker exec `execStub` steve.sh \'{"foo":3,"bar":{"foo":"bar"}}\''],
        ['docker kill `execStub`'],
      ]);
    });
  });
});

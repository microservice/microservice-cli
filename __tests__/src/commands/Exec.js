const sinon = require('sinon');
const rp = require('request-promise');
const ora = require('../../../src/ora');
const Exec = require('../../../src/commands/Exec');
const Microservice = require('../../../src/models/Microservice');
const utils = require('../../../src/utils');

describe('Exec.js', () => {
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
    utils.exec.restore();
    ora.start.restore();
    utils.getOpenPort.restore();
    successTextList = [];
  });

  describe('.go(command)', () => {
    test('throws an exception because not all required arguments are supplied', async () => {
      try {
        await new Exec('fake_docker_id', new Microservice({
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
        }), {}, {}).go('tom');
      } catch (e) {
        expect(e.message).toBe('Failed command: `tom`. Need to supply required arguments: `foo`');
      }
    });

    test('throws an exception because not all required environment variables are supplied', async () => {
      try {
        await new Exec('fake_docker_id', new Microservice({
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
        }, {}).go('tom');
      } catch (e) {
        expect(e.message).toBe('Failed command: `tom`. Need to supply required environment variables: `TOKEN`');
      }
    });

    describe('exec command', () => {
      test('runs an exec command', async () => {
        await new Exec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            test: {
              format: {
                command: 'test.sh',
              },
              output: {type: 'string'},
            },
          },
        }), {}, {}).go('test');

        expect(successTextList).toEqual(['Ran command: `test` with output: `execStub`']);
        expect(execStub.args).toEqual([
          ['docker run -td fake_docker_id tail -f /dev/null'],
          ['docker exec `execStub` test.sh'],
          ['docker kill `execStub`'],
        ]);
      });

      test('runs an exec command and fills in default environment variables and arguments', async () => {
        await new Exec('fake_docker_id', new Microservice({
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
        }), {}, {}).go('steve');

        expect(successTextList).toEqual(['Ran command: `steve` with output: `execStub`']);
        expect(execStub.args).toEqual([
          ['docker run -td fake_docker_id tail -f /dev/null'],
          ['docker exec `execStub` steve.sh \'{"foo":3,"bar":{"foo":"bar"}}\''],
          ['docker kill `execStub`'],
        ]);
      });
    });
    describe('http command', () => {
      let rpGetStub;
      let rpPostStub;
      let rpPutStub;
      let rpDeleteStub;

      beforeEach(() => {
        rpGetStub = sinon.stub(rp, 'get').callsFake(async () => 'get data');
        rpPostStub = sinon.stub(rp, 'post').callsFake(async () => 'post data');
        rpPutStub = sinon.stub(rp, 'put').callsFake(async () => 'put data');
        rpDeleteStub = sinon.stub(rp, 'delete').callsFake(async () => 'delete data');
      });

      afterEach(() => {
        rp.get.restore();
        rp.post.restore();
        rp.put.restore();
        rp.delete.restore();
      });

      test('command that gets', async () => {
        await new Exec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            get: {
              output: {type: 'string'},
              http: {
                method: 'get',
                port: 5555,
                path: '/get',
              },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'app.js'],
            },
          },
        }), {}, {}).go('get');

        expect(successTextList).toEqual(['Stared Docker container with id: `execStub`', 'Ran command: `get` with output: get data', 'Stopped Docker container: `execStub`']);
        expect(execStub.args[0][0]).toEqual('docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js');
        expect(execStub.args[1][0]).toEqual('docker kill `execStub`');
        expect(rpGetStub.calledWith('http://localhost:5555/get')).toBeTruthy();
      });

      test('command that posts', async () => {
        await new Exec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            post: {
              output: {type: 'string'},
              arguments: {
                isMale: {
                  type: 'boolean',
                  in: 'query',
                  required: true,
                },
                person_id: {
                  type: 'int',
                  in: 'path',
                  required: true,
                },
                data: {
                  type: 'string',
                  in: 'requestBody',
                  required: true,
                },
              },
              http: {
                method: 'post',
                port: 5555,
                path: '/person/{{person_id}}',
              },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'app.js'],
            },
          },
        }), {
          isMale: 'true',
          person_id: '2',
          data: 'data',
        }, {}).go('post');

        expect(successTextList).toEqual(['Stared Docker container with id: `execStub`', 'Ran command: `post` with output: post data', 'Stopped Docker container: `execStub`']);
        expect(execStub.args[0][0]).toEqual('docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js');
        expect(execStub.args[1][0]).toEqual('docker kill `execStub`');
        expect(rpPostStub.calledWith('http://localhost:5555/person/2?isMale=true', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{"data":"data"}',
        })).toBeTruthy();
      });

      test('command that puts', async () => {
        await new Exec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            put: {
              output: {type: 'string'},
              http: {
                method: 'put',
                port: 7777,
                path: '/cheese',
              },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'app.js'],
            },
          },
        }), {}, {}).go('put');

        expect(successTextList).toEqual(['Stared Docker container with id: `execStub`', 'Ran command: `put` with output: put data', 'Stopped Docker container: `execStub`']);
        expect(execStub.args[0][0]).toEqual('docker run -d -p 5555:7777 --entrypoint node fake_docker_id app.js');
        expect(execStub.args[1][0]).toEqual('docker kill `execStub`');
        expect(rpPutStub.calledWith('http://localhost:5555/cheese', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{}',
        })).toBeTruthy();
      });

      test('command that deletes', async () => {
        await new Exec('fake_docker_id', new Microservice({
          omg: 1,
          actions: {
            delete: {
              output: {type: 'string'},
              arguments: {
                id: {
                  type: 'int',
                  in: 'path',
                  required: true,
                },
              },
              http: {
                method: 'delete',
                port: 5555,
                path: '/user/{{id}}',
              },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'app.js'],
            },
          },
        }), {
          id: '2',
        }, {}).go('delete');

        expect(successTextList).toEqual(['Stared Docker container with id: `execStub`', 'Ran command: `delete` with output: delete data', 'Stopped Docker container: `execStub`']);
        expect(execStub.args[0][0]).toEqual('docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js');
        expect(execStub.args[1][0]).toEqual('docker kill `execStub`');
        expect(rpDeleteStub.calledWith('http://localhost:5555/user/2')).toBeTruthy();
      });
    });
  });
});

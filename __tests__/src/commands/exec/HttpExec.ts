import * as sinon from 'sinon';
import * as rp from 'request-promise';
import HttpExec from '../../../../src/commands/exec/HttpExec';
import Microservice from '../../../../src/models/Microservice';
import * as utils from '../../../../src/utils';

describe('HttpExec.js', () => {
  let execStub;
  let rpGetStub;
  let rpPostStub;
  let rpPutStub;
  let rpDeleteStub;

  beforeEach(() => {
    execStub = sinon.stub(utils, 'exec').callsFake(async () => '`execStub`');
    rpGetStub = sinon.stub(rp, 'get').callsFake(async () => 'get data');
    rpPostStub = sinon.stub(rp, 'post').callsFake(async () => 'post data');
    rpPutStub = sinon.stub(rp, 'put').callsFake(async () => 'put data');
    rpDeleteStub = sinon.stub(rp, 'delete').callsFake(async () => 'delete data');
    sinon.stub(utils, 'getOpenPort').callsFake(async () => 5555);
  });

  afterEach(() => {
    (utils.exec as any).restore();
    (rp.get as any).restore();
    (rp.post as any).restore();
    (rp.put as any).restore();
    (rp.delete as any).restore();
    (utils.getOpenPort as any).restore();
  });

  describe('.startService()', () => {
    test('starts service with lifecycle', async () => {
      const containerID = await new HttpExec('fake_docker_id', new Microservice({
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
      }), {}, {}).startService();

      expect(containerID).toBe('`execStub`');
      expect(execStub.args).toEqual([['docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js']]);
    });
  });

  describe('.isRunning()', () => {
    test('not running', async () => {
      (utils.exec as any).restore();
      execStub = sinon.stub(utils, 'exec').callsFake(async () => '[{"State":{"Running":false}}]');

      expect(await new HttpExec('fake_docker_id', new Microservice({
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
      }), {}, {}).isRunning()).toBeFalsy();
    });

    test('running', async () => {
      (utils.exec as any).restore();
      execStub = sinon.stub(utils, 'exec').callsFake(async () => '[{"State":{"Running":true}}]');

      expect(await new HttpExec('fake_docker_id', new Microservice({
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
      }), {}, {}).isRunning()).toBeTruthy();
    });
  });

  describe('.exec(action)', () => {
    test('action that gets', async () => {
      const httpExec = new HttpExec('fake_docker_id', new Microservice({
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
      }), {}, {});
      await httpExec.startService();

      await httpExec.exec('get');
      expect(execStub.args).toEqual([['docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js']]);
      expect(rpGetStub.calledWith('http://localhost:5555/get')).toBeTruthy();
    });

    test('action that posts', async () => {
      const httpExec = new HttpExec('fake_docker_id', new Microservice({
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
      }, {});
      await httpExec.startService();

      await httpExec.exec('post');
      expect(execStub.args).toEqual([['docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js']]);
      expect(rpPostStub.calledWith('http://localhost:5555/person/2?isMale=true', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"data":"data"}',
      })).toBeTruthy();
    });

    test('action that puts', async () => {
      const httpExec = new HttpExec('fake_docker_id', new Microservice({
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
      }), {}, {});
      await httpExec.startService();

      await httpExec.exec('put');
      expect(execStub.args).toEqual([['docker run -d -p 5555:7777 --entrypoint node fake_docker_id app.js']]);
      expect(rpPutStub.calledWith('http://localhost:5555/cheese', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      })).toBeTruthy();
    });

    test('action that deletes', async () => {
      const httpExec = new HttpExec('fake_docker_id', new Microservice({
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
      }, {});
      await httpExec.startService();

      await httpExec.exec('delete');
      expect(execStub.args).toEqual([['docker run -d -p 5555:5555 --entrypoint node fake_docker_id app.js']]);
      expect(rpDeleteStub.calledWith('http://localhost:5555/user/2')).toBeTruthy();
    });
  });
});

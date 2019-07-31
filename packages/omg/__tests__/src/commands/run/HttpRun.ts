import * as sinon from 'sinon'
import * as rp from 'request-promise'
import { Microservice } from 'omg-validate'
import HttpRun from '../../../../src/commands/run/HttpRun'
import * as utils from '../../../../src/utils'
import Run from '../../../../src/commands/run/Run'

describe('HttpRun.js', () => {
  let rpGetStub
  let rpPostStub
  let rpPutStub
  let rpDeleteStub
  let utilsDockerCreateContainer

  beforeEach(() => {
    rpGetStub = sinon.stub(rp, 'get').callsFake(async () => 'get_data')
    rpPostStub = sinon.stub(rp, 'post').callsFake(async () => 'post_data')
    rpPutStub = sinon.stub(rp, 'put').callsFake(async () => 'put_data')
    rpDeleteStub = sinon.stub(rp, 'delete').callsFake(async () => 'delete_data')
    utilsDockerCreateContainer = sinon.stub(utils.docker, 'createContainer').callsFake(async () => {
      return {
        start: () => {},
        $subject: {
          id: 'fake_docker_id',
        },
      }
    })
    Run.getHostIp = jest.fn().mockImplementation(async () => 'host.docker.internal toto')
    sinon.stub(utils, 'getOpenPort').callsFake(async () => 5555)
  })

  afterEach(() => {
    ;(rp.get as any).restore()
    ;(rp.post as any).restore()
    ;(rp.put as any).restore()
    ;(rp.delete as any).restore()
    ;(utils.docker.createContainer as any).restore()
    ;(utils.getOpenPort as any).restore()
  })

  describe('.startService()', () => {
    test('starts service with lifecycle', async () => {
      const containerID = await new HttpRun(
        'fake_docker_id',
        new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          actions: {
            get: {
              output: { type: 'string' },
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
          health: {
            http: {
              path: '/get',
              port: 5555,
            },
          },
        }),
        {},
        {},
      ).startService()

      if (!['darwin', 'win32'].includes(process.platform)) {
        expect(
          utilsDockerCreateContainer.calledWith({
            Image: 'fake_docker_id',
            Cmd: ['node', 'app.js'],
            Env: [],
            ExposedPorts: {
              '5555/tcp': {},
            },
            HostConfig: {
              PortBindings: {
                '5555/tcp': [
                  {
                    HostPort: '5555',
                  },
                ],
              },
              ExtraHosts: ['host.docker.internal toto'],
            },
          }),
        ).toBeTruthy()
      } else {
        expect(
          utilsDockerCreateContainer.calledWith({
            Image: 'fake_docker_id',
            Cmd: ['node', 'app.js'],
            Env: [],
            ExposedPorts: {
              '5555/tcp': {},
            },
            HostConfig: {
              PortBindings: {
                '5555/tcp': [
                  {
                    HostPort: '5555',
                  },
                ],
              },
              ExtraHosts: [],
            },
          }),
        ).toBeTruthy()
      }
      expect(containerID).toBe('fake_docker_id')
    })
  })

  describe('.isRunning()', () => {
    let utilsDockerGetContainer

    beforeEach(() => {
      utilsDockerGetContainer = sinon.stub(utils.docker, 'getContainer').callsFake(container => {
        return {
          inspect: async () => {
            return {
              State: {
                Running: false,
              },
            }
          },
        }
      })
    })

    afterEach(() => {
      ;(utils.docker.getContainer as any).restore()
    })

    test('not running', async () => {
      expect(
        await new HttpRun(
          'fake_docker_id',
          new Microservice({
            omg: 1,
            info: {
              version: '1.0.0',
              title: 'test',
              description: 'for tests',
            },
            health: {
              http: {
                path: '/health',
                port: 5555,
              },
            },
            actions: {
              get: {
                output: { type: 'string' },
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
          }),
          {},
          {},
        ).isRunning(),
      ).toBeFalsy()
    })

    test('running', async () => {
      ;(utils.docker.getContainer as any).restore()
      utilsDockerGetContainer = sinon.stub(utils.docker, 'getContainer').callsFake(container => {
        return {
          inspect: async () => {
            return {
              State: {
                Running: true,
              },
            }
          },
        }
      })

      expect(
        await new HttpRun(
          'fake_docker_id',
          new Microservice({
            omg: 1,
            info: {
              version: '1.0.0',
              title: 'test',
              description: 'for tests',
            },
            health: {
              http: {
                path: '/health',
                port: 5555,
              },
            },
            actions: {
              get: {
                output: { type: 'string' },
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
          }),
          {},
          {},
        ).isRunning(),
      ).toBeTruthy()
    })
  })

  describe('.exec(action)', () => {
    test('action that gets', async () => {
      const httpRun = new HttpRun(
        'fake_docker_id',
        new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          actions: {
            get: {
              output: { type: 'string' },
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
        }),
        {},
        {},
      )
      await httpRun.startService()

      const data = await httpRun.exec('get')
      expect(data).toBe('get_data')
      expect(rpGetStub.calledWith('http://localhost:5555/get')).toBeTruthy()
    })

    test('action that posts', async () => {
      const httpRun = new HttpRun(
        'fake_docker_id',
        new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          health: {
            http: {
              path: '/health',
              port: 5555,
            },
          },
          actions: {
            post: {
              output: { type: 'string' },
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
                path: '/person/{person_id}',
              },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'app.js'],
            },
          },
        }),
        {
          isMale: 'true',
          person_id: '2',
          data: 'data',
        },
        {},
      )
      await httpRun.startService()

      const data = await httpRun.exec('post')
      expect(data).toBe('post_data')
      expect(
        rpPostStub.calledWith('http://localhost:5555/person/2?isMale=true', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{"data":"data"}',
        }),
      ).toBeTruthy()
    })

    test('action that puts', async () => {
      const httpRun = new HttpRun(
        'fake_docker_id',
        new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          health: {
            http: {
              path: '/health',
              port: 7777,
            },
          },
          actions: {
            put: {
              output: { type: 'string' },
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
        }),
        {},
        {},
      )
      await httpRun.startService()

      const data = await httpRun.exec('put')
      expect(data).toBe('put_data')
      expect(
        rpPutStub.calledWith('http://localhost:5555/cheese', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: '{}',
        }),
      ).toBeTruthy()
    })

    test('action that deletes', async () => {
      const httpRun = new HttpRun(
        'fake_docker_id',
        new Microservice({
          omg: 1,
          info: {
            version: '1.0.0',
            title: 'test',
            description: 'for tests',
          },
          health: {
            http: {
              path: '/health',
              port: 5555,
            },
          },
          actions: {
            delete: {
              output: { type: 'string' },
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
                path: '/user/{id}',
              },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'app.js'],
            },
          },
        }),
        {
          id: '2',
        },
        {},
      )
      await httpRun.startService()

      const data = await httpRun.exec('delete')
      expect(data).toBe('delete_data')
      expect(rpDeleteStub.calledWith('http://localhost:5555/user/2')).toBeTruthy()
    })
  })
})

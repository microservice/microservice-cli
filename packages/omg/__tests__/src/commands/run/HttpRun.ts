import * as rp from 'request-promise'
import { Microservice } from 'omg-validate'
import HttpRun from '~/commands/run/HttpRun'
import * as utils from '~/utils'
import Run from '~/commands/run/Run'

jest.mock('request-promise')
jest.mock('~/utils/docker')
jest.mock('~/utils/getOpenPort')

describe('HttpRun.js', () => {
  beforeEach(() => {
    jest.spyOn(rp, 'get').mockImplementation(async () => 'get_data')
    jest.spyOn(rp, 'post').mockImplementation(async () => 'post_data')
    jest.spyOn(rp, 'put').mockImplementation(async () => 'put_data')
    jest.spyOn(rp, 'delete').mockImplementation(async () => 'delete_data')
    jest.spyOn(Run, 'getHostIp').mockImplementation(async () => 'host.docker.internal toto')
    ;(utils.docker.createContainer as jest.Mock).mockImplementation(async () => ({
      start: () => {},
      $subject: {
        id: 'fake_docker_id',
      },
    }))
    ;(utils.getOpenPort as jest.Mock).mockImplementation(async () => 5555)
  })

  afterEach(() => {
    jest.resetAllMocks()
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
        expect(utils.docker.createContainer).toHaveBeenCalledWith({
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
        })
      } else {
        expect(utils.docker.createContainer).toHaveBeenCalledWith({
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
        })
      }
      expect(containerID).toBe('fake_docker_id')
    })
  })

  describe('.isRunning()', () => {
    test('not running', async () => {
      ;(utils.docker.getContainer as jest.Mock).mockImplementation(container => ({
        inspect: async () => ({
          State: {
            Running: false,
          },
        }),
      }))

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
      ).toBe(false)
    })

    test('running', async () => {
      ;(utils.docker.getContainer as jest.Mock).mockImplementation(container => ({
        inspect: async () => ({
          State: {
            Running: true,
          },
        }),
      }))

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
      expect(rp.get).toHaveBeenCalledWith('http://localhost:5555/get')
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
      expect(rp.post).toHaveBeenCalledWith('http://localhost:5555/person/2?isMale=true', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"data":"data"}',
      })
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
      expect(rp.put).toHaveBeenCalledWith('http://localhost:5555/cheese', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      })
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
      expect(rp.delete).toHaveBeenCalledWith('http://localhost:5555/user/2')
    })
  })
})

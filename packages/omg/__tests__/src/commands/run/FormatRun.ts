import { Microservice } from 'omg-validate'
import FormatRun from '~/commands/run/FormatRun'
import * as utils from '~/utils'

jest.mock('~/utils/docker')
jest.mock('~/utils/getOpenPort')

describe('FormatRun.ts', () => {
  beforeEach(() => {
    ;(utils.getOpenPort as jest.Mock).mockImplementation(async () => 5555)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('.startService()', () => {
    beforeEach(() => {
      jest.spyOn(utils.docker, 'createContainer').mockImplementation(async data => ({
        $subject: {
          id: 'fake_docker_id',
        },
        start: () => {},
      }))
    })

    test('starts service with dev null default', async () => {
      const containerID = await new FormatRun(
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
              port: 5000,
            },
          },
          actions: {
            test: {
              format: {
                command: 'test.sh',
              },
              output: { type: 'string' },
            },
          },
        }),
        {},
        {},
      ).startService()

      expect(utils.docker.createContainer).toHaveBeenCalledWith({
        Image: 'fake_docker_id',
        Cmd: ['tail', '-f', '/dev/null'],
        Env: [],
      })
      expect(containerID).toBe('fake_docker_id')
    })

    test('starts service with lifecycle', async () => {
      const containerID = await new FormatRun(
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
              port: 5000,
            },
          },
          actions: {
            test: {
              format: {
                command: 'test.sh',
              },
              output: { type: 'string' },
            },
          },
          lifecycle: {
            startup: {
              command: ['node', 'start.js'],
            },
          },
        }),
        {},
        {},
      ).startService()

      expect(utils.docker.createContainer).toHaveBeenCalledWith({
        Image: 'fake_docker_id',
        Cmd: ['node', 'start.js'],
        Env: [],
      })
      expect(containerID).toBe('fake_docker_id')
    })
  })

  describe('.isRunning()', () => {
    beforeEach(() => {
      jest.spyOn(utils.docker, 'getContainer').mockImplementation(container => ({
        inspect: async () => ({
          State: {
            Running: false,
          },
        }),
      }))
    })

    test('not running', async () => {
      expect(
        await new FormatRun(
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
                port: 5000,
              },
            },
            actions: {
              test: {
                format: {
                  command: 'test.sh',
                },
                output: { type: 'string' },
              },
            },
            lifecycle: {
              startup: {
                command: ['node', 'start.js'],
              },
            },
          }),
          {},
          {},
        ).isRunning(),
      ).toBeFalsy()
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
        await new FormatRun(
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
                port: 5000,
              },
            },
            actions: {
              test: {
                format: {
                  command: 'test.sh',
                },
                output: { type: 'string' },
              },
            },
            lifecycle: {
              startup: {
                command: ['node', 'start.js'],
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
    test('throws an exception because not all required arguments are supplied', async () => {
      try {
        await new FormatRun(
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
                port: 5000,
              },
            },
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
          }),
          {},
          {},
        ).exec('tom')
      } catch (e) {
        expect(e).toBe('Need to supply required arguments: `foo`')
      }
    })

    test('throws an exception because not all required environment variables are supplied', async () => {
      try {
        await new FormatRun(
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
                port: 5000,
              },
            },
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
          }),
          {
            foo: '1.1',
          },
          {},
        ).exec('tom')
      } catch (e) {
        expect(e).toBe('Need to supply required environment variables: `TOKEN`')
      }
    })
  })
})

import fs from 'fs'
import { Microservice } from 'oms-validate'
import * as rp from '~/request'
import * as utils from '~/utils'
import Subscribe from '~/commands/Subscribe'
import HttpRun from '~/commands/run/HttpRun'

jest.mock('fs')
jest.mock('~/utils/getOpenPort')

describe('Subscribe.ts', () => {
  beforeEach(() => {
    ;(fs.existsSync as jest.Mock).mockImplementation(() => true)
    ;(utils.getOpenPort as jest.Mock).mockImplementation(async () => 4444)

    jest.spyOn(rp, 'makeRequest').mockImplementation(async () => ({}))
    jest.spyOn(process, 'cwd').mockImplementation(() => 'path/to/oms/directory')
    jest.spyOn(JSON, 'parse').mockImplementation(() => ({
      'path/to/oms/directory': {
        ports: {
          5000: 4444,
        },
      },
    }))
    // @ts-ignore
    jest.spyOn(Subscribe.prototype, 'startOMSServer').mockImplementation(() => {
      return {
        listen() {
          /* No op */
        },
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('.go(event)', () => {
    const m = new Microservice({
      oms: 1,
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
        foo: {
          events: {
            bar: {
              arguments: {
                x: {
                  type: 'int',
                  in: 'requestBody',
                  required: true,
                },
              },
              http: {
                port: 5000,
                subscribe: {
                  method: 'post',
                  path: '/sub',
                },
                unsubscribe: {
                  method: 'post',
                  path: '/sub',
                },
              },
            },
          },
        },
      },
    })

    test('fails because required arguments are not supplied', async () => {
      try {
        await new Subscribe(m, {}, new HttpRun('docker_image', m, {}, {})).go('foo', 'bar')
      } catch (e) {
        expect(e).toBe('Failed subscribing to event: `bar`. Need to supply required arguments: `x`')
      }
    })

    test('subscribes to the event', async () => {
      await new Subscribe(m, { x: '1' }, new HttpRun('docker_image', m, {}, {})).go('foo', 'bar')

      expect((rp.makeRequest as jest.Mock).mock.calls[0][0]).toMatchObject({
        body: {
          data: {
            x: 1,
          },
          endpoint: 'http://host.docker.internal:4444',
        },
        json: true,
        method: 'post',
        uri: 'http://localhost:4444/sub',
      })
    })
  })
})

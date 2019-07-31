import { EnvironmentVariable, Microservice } from 'omg-validate'
import * as sinon from 'sinon'
import * as utils from '../../src/utils'

describe('utils.ts', () => {
  describe('setVal(val, _else)', () => {
    test(`sets the value to val because it's given`, () => {
      expect(utils.setVal(1, 3)).toBe(1)
    })

    test('sets the value to _else because val is null', () => {
      expect(utils.setVal(undefined, 3)).toBe(3)
    })
  })

  describe('getNeededPorts(microservice)', () => {
    test('returns an empty list because there are no actions that interface via http', () => {
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        health: {
          http: {
            port: 5000,
            path: '/health',
          },
        },
      })

      expect(utils.getNeededPorts(m)).toEqual([5000])
    })

    test('returns a list consisting of the port 5050 and 6060 because it is used by a http interfacing action', () => {
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        lifecycle: {
          startup: {
            command: 'server.sh',
          },
        },
        health: {
          http: {
            path: '/health',
            port: 5050,
          },
        },
        actions: {
          foo: {
            http: {
              method: 'get',
              port: 5050,
              path: '/c',
            },
          },
          baz: {
            events: {
              fizz: {
                http: {
                  subscribe: {
                    port: 6060,
                    path: '/sub',
                    method: 'post',
                  },
                  unsubscribe: {
                    port: 6061,
                    path: '/unsub',
                    method: 'post',
                  },
                },
              },
            },
          },
          bar: {
            format: {
              command: 'bar.sh',
            },
          },
        },
      })

      expect(utils.getNeededPorts(m)).toEqual([5050, 6060, 6061])
    })

    test('returns a forward port', () => {
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        lifecycle: {
          startup: {
            command: 'server.sh',
          },
        },
        health: {
          http: {
            path: '/health',
            port: 5050,
          },
        },
        forward: {
          ui: {
            http: {
              path: '/ui',
              port: 8080,
            },
          },
        },
      })
      expect(utils.getNeededPorts(m)).toEqual([8080, 5050])
    })
  })

  describe('parse(list, errorMessage)', () => {
    test('parses the list', () => {
      const result = utils.parse(['key=val', 'foo=bar', 'fizz=buzz'], 'Error message.')

      expect(result).toEqual({
        key: 'val',
        foo: 'bar',
        fizz: 'buzz',
      })
    })

    test('errors because delimiter is not present in on of the elements', () => {
      try {
        utils.parse(['key=val', 'foo=bar', 'fizz:buzz'], 'Error message.')
      } catch (e) {
        expect(e).toEqual({ message: 'Error message.' })
      }
    })
  })

  describe('matchEnvironmentCases(env, environmentVariables)', () => {
    test('fixes the cases', () => {
      const environmentVariables = [
        new EnvironmentVariable('nAme', { type: 'string' }),
        new EnvironmentVariable('name2', { type: 'string' }),
        new EnvironmentVariable('NAME3', { type: 'string' }),
      ]
      const env = {
        name: 1,
        name2: 2,
        name3: 3,
      }

      expect(utils.matchEnvironmentCases(env, environmentVariables)).toEqual({
        nAme: 1,
        name2: 2,
        NAME3: 3,
      })
    })
  })

  describe('exec(command)', () => {
    test('runs a command', async done => {
      const result = await utils.exec('echo skrt')

      expect(result).toBe('skrt')
      done()
    })

    test('errors a command', async done => {
      try {
        await utils.exec('skrt')
      } catch (e) {
        expect(e.includes('/bin/sh:')).toBeTruthy() // the stderror differs
        expect(e.includes('skrt')).toBeTruthy() // on different oses so test
        expect(e.includes('not found')).toBeTruthy() // must be done like this
        done()
      }
    })
  })

  describe('{ typeCast }', () => {
    test('casts an integer', () => {
      expect(typeof utils.typeCast.int('20')).toBe('number')
    })

    test('casts a float', () => {
      expect(typeof utils.typeCast.float('20.20')).toBe('number')
    })

    test('casts a string', () => {
      expect(typeof utils.typeCast.string('test')).toBe('string')
    })

    test('casts a uuid', () => {
      expect(typeof utils.typeCast.uuid('2d9eb156-d047-428a-b5c1-b1b6c55e56ab')).toBe('string')
    })

    test('casts a list', () => {
      expect(typeof utils.typeCast.list('["val"]')).toBe('object')
    })

    test('cast a map', () => {
      expect(typeof utils.typeCast.map('{"key": "val"}')).toBe('object')
    })

    test('cast an object', () => {
      expect(typeof utils.typeCast.object('{"key": "val"}')).toBe('object')
    })

    test('cast a boolean', () => {
      expect(typeof utils.typeCast.boolean('true')).toBe('boolean')
    })

    test('cast a path', () => {
      expect(typeof utils.typeCast.path('/path')).toBe('string')
    })
  })

  describe('{ dataTypes }', () => {
    test('type checks a stringified integer', () => {
      expect(utils.dataTypes.int('20')).toBeTruthy()
      expect(utils.dataTypes.int('20.2')).toBeFalsy()
      expect(utils.dataTypes.int('asd')).toBeFalsy()
    })

    test('type checks a stringified float', () => {
      expect(utils.dataTypes.float('20.20')).toBeTruthy()
      expect(utils.dataTypes.float('20')).toBeFalsy()
      expect(utils.dataTypes.float('asd')).toBeFalsy()
    })

    test('type checks a stringified string', () => {
      expect(utils.dataTypes.string('any')).toBeTruthy()
    })

    test('type checks a stringified uuid', () => {
      expect(utils.dataTypes.uuid('db3a6ed8-5419-4c35-8640-1e46ef27f94d')).toBeTruthy()
      expect(utils.dataTypes.uuid('db3a6')).toBeFalsy()
    })

    test('type checks a stringified list', () => {
      expect(utils.dataTypes.list('["data"]')).toBeTruthy()
      expect(utils.dataTypes.list('{"data": "value"}')).toBeFalsy()
      expect(utils.dataTypes.list('asd')).toBeFalsy()
      expect(utils.dataTypes.list('{"a": 1}')).toBeFalsy()
    })

    test('type checks a stringified map', () => {
      expect(utils.dataTypes.map('{"data": "value"}')).toBeTruthy()
      expect(utils.dataTypes.map('["data"]')).toBeFalsy()
      expect(utils.dataTypes.map('asd')).toBeFalsy()
    })

    test('type checks a stringified object', () => {
      expect(utils.dataTypes.object('{"data": "value"}')).toBeTruthy()
      expect(utils.dataTypes.object('["data"]')).toBeFalsy()
      expect(utils.dataTypes.object('asd')).toBeFalsy()
    })

    test('type checks a stringified boolean', () => {
      expect(utils.dataTypes.boolean('true')).toBeTruthy()
      expect(utils.dataTypes.boolean('false')).toBeTruthy()
      expect(utils.dataTypes.boolean('{"data": "value"}')).toBeFalsy()
      expect(utils.dataTypes.boolean('asd')).toBeFalsy()
    })

    test('type checks a stringified path', () => {
      expect(utils.dataTypes.path('/path')).toBeTruthy()
      expect(utils.dataTypes.path('dataPath')).toBeTruthy()
      expect(utils.dataTypes.path('{"data": "value"}')).toBeFalsy()
    })
  })

  describe('getOpenPort()', () => {
    test('gets an open port', async done => {
      const port = await utils.getOpenPort()

      expect(port <= 17000).toBeTruthy()
      expect(port >= 2000).toBeTruthy()
      done()
    })
  })

  describe('sleep(ms)', () => {
    test('waits the given time in ms', async () => {
      const start = Date.now()
      await utils.sleep(1000)
      const end = Date.now()

      expect(end - start).toBeGreaterThanOrEqual(1000)
    })
  })

  describe('getForwardPorts(microservice)', () => {
    test('returns a forward port', () => {
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        lifecycle: {
          startup: {
            command: 'server.sh',
          },
        },
        health: {
          http: {
            path: '/health',
            port: 5050,
          },
        },
        forward: {
          ui: {
            http: {
              path: '/ui',
              port: 8080,
            },
          },
        },
      })
      expect(utils.getForwardPorts(m)).toEqual([8080])
    })
  })

  describe('getHealthPort(microservice)', () => {
    test('returns the health port', () => {
      const m = new Microservice({
        omg: 1,
        info: {
          version: '1.0.0',
          title: 'test',
          description: 'for tests',
        },
        lifecycle: {
          startup: {
            command: 'server.sh',
          },
        },
        health: {
          http: {
            path: '/health',
            port: 5050,
          },
        },
      })
      expect(utils.getHealthPort(m)).toEqual(5050)
    })
  })

  describe('createImageName()', () => {
    let utilsExecRemote

    afterEach(() => {
      ;(utils.exec as any).restore()
    })

    test('returns the git remote', async () => {
      utilsExecRemote = sinon.stub(utils, 'exec').callsFake(async () => {
        return 'origin  git@github.com:microservices/omg.git (fetch)\norigin  git@github.com:microservices/omg.git (push)'
      })

      expect(await utils.createImageName()).toBe('omg/microservices/omg')
    })

    test('returns the git remote for UI', async () => {
      utilsExecRemote = sinon.stub(utils, 'exec').callsFake(async () => {
        return 'origin  git@github.com:microservices/omg.git (fetch)\norigin  git@github.com:microservices/omg.git (push)'
      })

      expect(await utils.createImageName(true)).toBe('microservices/omg')
    })

    test('returns the http', async () => {
      utilsExecRemote = sinon.stub(utils, 'exec').callsFake(async () => {
        return 'origin  https://github.com/microservice/machinebox-classificationbox (fetch)\norigin  https://github.com/microservice/machinebox-classificationbox (push)'
      })

      expect(await utils.createImageName()).toBe('omg/microservices/omg')
    })

    test('returns the http for UI', async () => {
      utilsExecRemote = sinon.stub(utils, 'exec').callsFake(async () => {
        return 'origin  https://github.com/microservice/machinebox-classificationbox (fetch)\norigin  https://github.com/microservice/machinebox-classificationbox (push)'
      })

      expect(await utils.createImageName(true)).toBe('microservices/omg')
    })
  })
})

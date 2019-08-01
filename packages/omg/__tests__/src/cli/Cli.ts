import * as fs from 'fs'
import ora from 'ora'

import * as utils from '~/utils'
import Build from '~/commands/Build'
import Run from '~/commands/run/Run'
import FormatRun from '~/commands/run/FormatRun'
import Subscribe from '~/commands/Subscribe'
import Cli from '~/cli/Cli'

jest.mock('fs')
jest.mock('ora')
jest.mock('~/utils/createImageName')
jest.mock('~/utils/docker')
jest.mock('~/utils/error')
jest.mock('~/utils/log')

describe('Cli.ts', () => {
  const origArgv = process.argv

  beforeEach(() => {
    jest.spyOn(ora, 'default').mockImplementation(
      () =>
        ({
          start: () => ({
            succeed: text => {},
            info: text => {},
          }),
        } as any),
    )

    // @ts-ignore
    jest.spyOn(process, 'exit').mockImplementation(() => {
      /* No op */
    })
    ;(fs.existsSync as jest.Mock).mockImplementation(() => true)
    ;(fs.readFileSync as jest.Mock).mockImplementation(
      () =>
        'omg: 1\n' +
        'info:\n' +
        '  version: 1.0.0\n' +
        '  title: test\n' +
        '  description: for tests\n' +
        'health:\n' +
        '  http:\n' +
        '    port: 5000\n' +
        '    path: /health\n' +
        'actions:\n' +
        '  action:\n' +
        '    format:\n' +
        '      command: ["action.sh"]\n' +
        '  eventAction:\n' +
        '    events:\n' +
        '      event:\n' +
        '        http:\n' +
        '          port: 5000\n' +
        '          subscribe:\n' +
        '            method: post\n' +
        '            path: /subscribe\n' +
        '          unsubscribe:\n' +
        '            path: /unsubscribe\n' +
        '            method: delete',
    )
    ;(utils.createImageName as jest.Mock).mockImplementation(async () => 'image-name')
  })

  afterEach(() => {
    jest.resetAllMocks()
    process.argv = origArgv.slice()
  })

  describe('constructor', () => {
    test('Cli is constructed and the process does not exit', () => {
      new Cli()

      expect(utils.error).not.toBeCalled()
      expect(process.exit).not.toBeCalled()
    })

    test('Cli is not constructed because we are not in a omg directory', () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)
      process.argv = ['1', '2', '3']
      new Cli()

      // expect(utils.error.calledWith('Must be run in a directory with a `Dockerfile` and a `microservice.yml`')).toBeTruthy();
      expect(process.exit).toHaveBeenCalledWith(1)
    })
  })

  describe('.buildMicroservice()', () => {
    test('builds the microservice', () => {
      const cli = new Cli()
      cli.buildMicroservice()

      expect(utils.error).not.toBeCalled()
      expect(process.exit).not.toBeCalled()
    })

    test('errors out because the `microservice.yml` is not valid', () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(() => 'foo: bar')
      const cli = new Cli()
      cli.buildMicroservice()

      expect(utils.error).toBeCalledWith(
        "3 errors found:\n  1. root should NOT have additional properties\n  2. root should have required property 'omg'\n  3. root should have required property 'info'",
      )
      expect(process.exit).toBeCalledWith(1)
    })
  })

  describe('.actionHelp(actionName)', () => {
    test('builds the microservice', () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(
        () =>
          'omg: 1\n' +
          'info:\n' +
          '  version: 1.0.0\n' +
          '  title: test\n' +
          '  description: for tests\n' +
          'health:\n' +
          '  http:\n' +
          '    path: /health\n' +
          '    port: 5000\n' +
          'actions:\n' +
          '  action:\n' +
          '    format:\n' +
          '      command: ["action.sh"]',
      )
      const cli = new Cli()
      cli.buildMicroservice()
      cli.actionHelp('action')
      expect((utils.log as jest.Mock).mock.calls[0][0]).toContain('Action `action` details:')
    })
  })

  describe('Cli.validate(options)', () => {
    describe('valid `microservice.yml`', () => {
      test('silent option', () => {
        Cli.validate({ silent: true })

        expect(utils.log.calledWith('')).toBeTruthy()
        expect(process.exit.calledWith(0)).toBeTruthy()
      })

      test('json option', () => {
        Cli.validate({ json: true })

        expect(
          utils.log.calledWith(
            '{\n' +
              '  "valid": true,\n' +
              '  "yaml": {\n' +
              '    "omg": 1,\n' +
              '    "info": {\n' +
              '      "version": "1.0.0",\n' +
              '      "title": "test",\n' +
              '      "description": "for tests"\n' +
              '    },\n' +
              '    "health": {\n' +
              '      "http": {\n' +
              '        "port": 5000,\n' +
              '        "path": "/health"\n' +
              '      }\n' +
              '    },\n' +
              '    "actions": {\n' +
              '      "action": {\n' +
              '        "format": {\n' +
              '          "command": [\n' +
              '            "action.sh"\n' +
              '          ]\n' +
              '        }\n' +
              '      },\n' +
              '      "eventAction": {\n' +
              '        "events": {\n' +
              '          "event": {\n' +
              '            "http": {\n' +
              '              "port": 5000,\n' +
              '              "subscribe": {\n' +
              '                "method": "post",\n' +
              '                "path": "/subscribe",\n' +
              '                "port": 5000\n' +
              '              },\n' +
              '              "unsubscribe": {\n' +
              '                "path": "/unsubscribe",\n' +
              '                "method": "delete",\n' +
              '                "port": 5000\n' +
              '              }\n' +
              '            }\n' +
              '          }\n' +
              '        }\n' +
              '      }\n' +
              '    }\n' +
              '  },\n' +
              '  "errors": null,\n' +
              '  "text": "No errors"\n' +
              '}',
          ),
        ).toBeTruthy()
        expect(process.exit.calledWith(0)).toBeTruthy()
      })

      test('no options', () => {
        Cli.validate({})

        expect(utils.log.calledWith('No errors')).toBeTruthy()
        expect(process.exit.calledWith(0)).toBeTruthy()
      })
    })

    describe('invalid `microservice.yml`', () => {
      // we need to make the return value fail the test, and we already stubbed in the layer above this
      // so we need to restore and re-wrap it, then the next layer will restore
      beforeEach(() => {
        ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
          return 'foo: bar'
        })
      })

      test('silent option', () => {
        Cli.validate({ silent: true })

        expect(utils.error.calledWith('')).toBeTruthy()
        expect(process.exit.calledWith(1)).toBeTruthy()
      })

      test('json option', () => {
        Cli.validate({ json: true })

        expect(
          utils.error.calledWith(
            '{\n' +
              '  "valid": false,\n' +
              '  "issue": {\n' +
              '    "foo": "bar"\n' +
              '  },\n' +
              '  "errors": [\n' +
              '    {\n' +
              '      "keyword": "additionalProperties",\n' +
              '      "dataPath": "",\n' +
              '      "schemaPath": "#/additionalProperties",\n' +
              '      "params": {\n' +
              '        "additionalProperty": "foo"\n' +
              '      },\n' +
              '      "message": "should NOT have additional properties"\n' +
              '    },\n' +
              '    {\n' +
              '      "keyword": "required",\n' +
              '      "dataPath": "",\n' +
              '      "schemaPath": "#/required",\n' +
              '      "params": {\n' +
              '        "missingProperty": "omg"\n' +
              '      },\n' +
              '      "message": "should have required property \'omg\'"\n' +
              '    },\n' +
              '    {\n' +
              '      "keyword": "required",\n' +
              '      "dataPath": "",\n' +
              '      "schemaPath": "#/required",\n' +
              '      "params": {\n' +
              '        "missingProperty": "info"\n' +
              '      },\n' +
              '      "message": "should have required property \'info\'"\n' +
              '    }\n' +
              '  ],\n' +
              '  "text": "root should NOT have additional properties, root should have required property \'omg\', root should have required property \'info\'"\n' +
              '}',
          ),
        ).toBeTruthy()
        expect(process.exit.calledWith(1)).toBeTruthy()
      })

      test('no options', () => {
        Cli.validate({})

        expect(
          utils.error.calledWith(
            "3 errors found:\n  1. root should NOT have additional properties\n  2. root should have required property 'omg'\n  3. root should have required property 'info'",
          ),
        ).toBeTruthy()
        expect(process.exit.calledWith(1)).toBeTruthy()
      })
    })
  })

  describe('.build(options)', () => {
    let buildGoStub

    beforeEach(() => {
      utils.exec as jest.Mock
    })

    afterEach(() => {
      ;(utils.exec as any).restore()
    })

    // not able to spy on constructor with sinon yet
    beforeEach(() => {
      buildGoStub = Build.prototype.go as jest.Mock
    })

    afterEach(() => {
      ;(Build.prototype.go as any).restore()
    })

    test('builds with given tag', async () => {
      await Cli.build({ tag: 'tag' })

      expect(buildGoStub.called).toBeTruthy()
      expect(utils.error.called).toBeFalsy()
      expect(process.exit.called).toBeFalsy()
    })

    test('builds with git remote name', async () => {
      await Cli.build({})

      expect(buildGoStub.called).toBeTruthy()
      expect(utils.error.called).toBeFalsy()
      expect(process.exit.called).toBeFalsy()
    })
  })

  describe('.run(action, options)', () => {
    let formatRunRunStub

    beforeEach(() => {
      ;(utils.docker.listImages as jest.Mock).mockImplementation(async () => [{ RepoTags: ['image'] }])
      ;(FormatRun.prototype.startService as jest.Mock).mockImplementation(async () => 'started_id')
      ;(Run.prototype.isRunning as jest.Mock).mockImplementation(async () => true)
      formatRunRunStub = (FormatRun.prototype.exec as jest.Mock).mockImplementation(async action => 'output')
      ;(Run.prototype.stopService as jest.Mock).mockImplementation(async () => 'stoped_id')
    })

    afterEach(() => {
      ;(utils.docker.listImages as any).restore()
      ;(FormatRun.prototype.startService as any).restore()
      ;(Run.prototype.isRunning as any).restore()
      ;(FormatRun.prototype.exec as any).restore()
      ;(Run.prototype.stopService as any).restore()
    })

    test('does not execute action because arguments are not given', async () => {
      const cli = new Cli()
      cli.buildMicroservice()
      await cli.run('action', {})

      expect(utils.error.calledWith('Failed to parse command, run `omg run --help` for more information.')).toBeTruthy()
      expect(process.exit.calledWith(1)).toBeTruthy()
      expect(formatRunRunStub.called).toBeFalsy()
    })

    // test('image option given and action is executed', async () => {
    //   (utils.docker.listImages as any).restore();
    //   ;(utils.docker.listImages as jest.Mock).mockImplementation(async () => [{RepoTags: ['image']}]);
    //   const cli = new Cli();
    //   cli.buildMicroservice();
    //   await cli.run('action', {args: [], envs: [], image: 'image'});

    //   expect(successList).toEqual(['Started Docker container: started_id', 'Health check passed', 'Ran action: `action` with output: output', 'Stopped Docker container: stoped_id']);
    //   expect(formatRunRunStub.calledWith('action')).toBeTruthy();
    // });

    test('image option given but is not build so action is not executed', async () => {
      ;(utils.docker.listImages as any).restore()
      ;(utils.docker.listImages as jest.Mock).mockImplementation(async () => [{ RepoTags: ['wrong'] }])
      const cli = new Cli()
      cli.buildMicroservice()
      await cli.run('action', { args: [], envs: [], image: 'does-not-exist' })

      expect(utils.error.calledWith('Image for microservice is not built. Run `omg build` to build the image.')).toBeTruthy()
      expect(process.exit.calledWith(1)).toBeTruthy()
      expect(formatRunRunStub.called).toBeFalsy()
    })
  })

  describe('.subscribe(event, options)', () => {
    let cliRunStub
    let subscribeGoStub

    beforeEach(() => {
      cliRunStub = Cli.prototype.run as jest.Mock
      subscribeGoStub = Subscribe.prototype.go as jest.Mock
    })

    afterEach(() => {
      ;(Cli.prototype.run as any).restore()
      ;(Subscribe.prototype.go as any).restore()
    })

    // test('subscribes to the event', async () => {
    //   const cli = new Cli()
    //   cli.buildMicroservice()
    //   await cli.subscribe('eventAction', 'event', { args: [], envs: [] })

    //   expect(cliRunStub.args[0]).toEqual([
    //     'eventAction',
    //     { args: [], envs: [] }
    //   ])
    //   expect(subscribeGoStub.args[0]).toEqual(['eventAction', 'event'])
    // })
  })
})

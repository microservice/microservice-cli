import * as fs from 'fs'

import * as utils from '~/utils'
import Build from '~/commands/Build'
import Run from '~/commands/run/Run'
import FormatRun from '~/commands/run/FormatRun'
import Cli from '~/cli/Cli'
import ora from '~/utils/ora'

jest.mock('fs')
jest.mock('~/utils/createImageName')
jest.mock('~/utils/docker')
jest.mock('~/utils/error')
jest.mock('~/utils/log')

describe('Cli.ts', () => {
  const origArgv = process.argv

  beforeEach(() => {
    // @ts-ignore
    jest.spyOn(ora, 'start').mockReturnValue({
      succeed: jest.fn(),
      info: jest.fn(),
    })

    // @ts-ignore
    jest.spyOn(process, 'exit').mockImplementation(() => {
      /* No op */
    })
    ;(fs.existsSync as jest.Mock).mockImplementation(() => true)
    ;(fs.readFileSync as jest.Mock).mockImplementation(
      () =>
        'oms: 1\n' +
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

    test('Cli is not constructed because we are not in a oms directory', () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)
      process.argv = ['1', '2', '3']
      new Cli()

      // expect(utils.error.toBeCalledWith('Must be run in a directory with a `Dockerfile` and a `oms.yml`')).toBeTruthy();
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

    test('errors out because the `oms.yml` is not valid', () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(() => 'foo: bar')
      const cli = new Cli()
      cli.buildMicroservice()

      expect(utils.error).toBeCalledWith(
        '5 errors found:\n' +
          '  1. root should NOT have additional properties\n' +
          "  2. root should have required property 'info'\n" +
          "  3. root should have required property 'omg'\n" +
          "  4. root should have required property 'oms'\n" +
          '  5. root should match exactly one schema in oneOf',
      )
      expect(process.exit).toBeCalledWith(1)
    })
  })

  describe('.actionHelp(actionName)', () => {
    test('builds the microservice', () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(
        () =>
          'oms: 1\n' +
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
    describe('valid `oms.yml`', () => {
      test('silent option', () => {
        Cli.validate({ silent: true })

        expect(utils.log).toBeCalledWith('')
        expect(process.exit).toBeCalledWith(0)
      })

      test('json option', () => {
        Cli.validate({ json: true })

        expect(utils.log).toBeCalledWith(
          '{\n' +
            '  "valid": true,\n' +
            '  "yaml": {\n' +
            '    "oms": 1,\n' +
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
        )
        expect(process.exit).toBeCalledWith(0)
      })

      test('no options', () => {
        Cli.validate({})

        expect(utils.log).toBeCalledWith('No errors')
        expect(process.exit).toBeCalledWith(0)
      })
    })

    describe('invalid `oms.yml`', () => {
      // we need to make the return value fail the test, and we already stubbed in the layer above this
      // so we need to restore and re-wrap it, then the next layer will restore
      beforeEach(() => {
        ;(fs.readFileSync as jest.Mock).mockImplementation(() => 'foo: bar')
      })

      test('silent option', () => {
        Cli.validate({ silent: true })

        expect(utils.error).toBeCalledWith('')
        expect(process.exit).toBeCalledWith(1)
      })

      test('json option', () => {
        Cli.validate({ json: true })

        expect(utils.error).toBeCalledWith(
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
            '        "missingProperty": "info"\n' +
            '      },\n' +
            '      "message": "should have required property \'info\'"\n' +
            '    },\n' +
            '    {\n' +
            '      "keyword": "required",\n' +
            '      "dataPath": "",\n' +
            '      "schemaPath": "#/oneOf/0/required",\n' +
            '      "params": {\n' +
            '        "missingProperty": "omg"\n' +
            '      },\n' +
            '      "message": "should have required property \'omg\'"\n' +
            '    },\n' +
            '    {\n' +
            '      "keyword": "required",\n' +
            '      "dataPath": "",\n' +
            '      "schemaPath": "#/oneOf/1/required",\n' +
            '      "params": {\n' +
            '        "missingProperty": "oms"\n' +
            '      },\n' +
            '      "message": "should have required property \'oms\'"\n' +
            '    },\n' +
            '    {\n' +
            '      "keyword": "oneOf",\n' +
            '      "dataPath": "",\n' +
            '      "schemaPath": "#/oneOf",\n' +
            '      "params": {\n' +
            '        "passingSchemas": null\n' +
            '      },\n' +
            '      "message": "should match exactly one schema in oneOf"\n' +
            '    }\n' +
            '  ],\n' +
            "  \"text\": \"root should NOT have additional properties, root should have required property 'info', root should have required property 'omg', root should have required property 'oms', root should match exactly one schema in oneOf\"\n" +
            '}',
        )
        expect(process.exit).toBeCalledWith(1)
      })

      test('no options', () => {
        Cli.validate({})

        expect(utils.error).toBeCalledWith(
          '5 errors found:\n' +
            '  1. root should NOT have additional properties\n' +
            "  2. root should have required property 'info'\n" +
            "  3. root should have required property 'omg'\n" +
            "  4. root should have required property 'oms'\n" +
            '  5. root should match exactly one schema in oneOf',
        )
        expect(process.exit).toBeCalledWith(1)
      })
    })
  })

  describe('.build(options)', () => {
    beforeEach(() => {
      // @ts-ignore
      jest.spyOn(Build.prototype, 'go').mockImplementation(() => {})
    })

    test('builds with given tag', async () => {
      await Cli.build({ tag: 'tag' })

      expect(Build.prototype.go).toBeCalled()
      expect(utils.error).not.toBeCalled()
      expect(process.exit).not.toBeCalled()
    })

    test('builds with git remote name', async () => {
      await Cli.build({})

      expect(Build.prototype.go).toBeCalled()
      expect(utils.error).not.toBeCalled()
      expect(process.exit).not.toBeCalled()
    })
  })

  describe('.run(action, options)', () => {
    beforeEach(() => {
      ;(utils.docker.listImages as jest.Mock).mockImplementation(async () => [{ RepoTags: ['image'] }])
      jest.spyOn(Run.prototype, 'isRunning').mockImplementation(async () => true)
      jest.spyOn(Run.prototype, 'stopService').mockImplementation(async () => 'stopped_id')
      jest.spyOn(FormatRun.prototype, 'startService').mockImplementation(async () => 'started_id')
      jest.spyOn(FormatRun.prototype, 'exec').mockImplementation(async action => 'output')
    })

    test('does not execute action because arguments are not given', async () => {
      const cli = new Cli()
      cli.buildMicroservice()
      await cli.run('action', {})

      expect(utils.error).toBeCalledWith('Failed to parse command, run `oms run --help` for more information.')
      expect(process.exit).toBeCalledWith(1)
      expect(FormatRun.prototype.exec).not.toHaveBeenCalled()
    })

    // test('image option given and action is executed', async () => {
    //   ;(utils.docker.listImages as jest.Mock).mockImplementation(async () => [{RepoTags: ['image']}]);
    //   const cli = new Cli();
    //   cli.buildMicroservice();
    //   await cli.run('action', {args: [], envs: [], image: 'image'});

    //   expect(successList).toEqual(['Started Docker container: started_id', 'Health check passed', 'Ran action: `action` with output: output', 'Stopped Docker container: stopped_id']);
    //   expect(formatRunRunStub.toBeCalledWith('action')).toBeTruthy();
    // });

    test('image option given but is not build so action is not executed', async () => {
      ;(utils.docker.listImages as jest.Mock).mockImplementation(async () => [{ RepoTags: ['wrong'] }])
      const cli = new Cli()
      cli.buildMicroservice()
      await cli.run('action', { args: [], envs: [], image: 'does-not-exist' })

      expect(utils.error).toBeCalledWith('Image for microservice is not built. Run `oms build` to build the image.')
      expect(process.exit).toBeCalledWith(1)
      expect(FormatRun.prototype.exec).not.toHaveBeenCalled()
    })
  })

  // describe('.subscribe(event, options)', () => {
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
  // })
})

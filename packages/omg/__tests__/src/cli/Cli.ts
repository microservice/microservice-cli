import * as fs from 'fs';
import * as sinon from 'sinon';
import * as utils from '../../../src/utils';
import ora from '../../../src/ora';
import Build from '../../../src/commands/Build';
import Run from '../../../src/commands/run/Run';
import FormatRun from '../../../src/commands/run/FormatRun';
import Subscribe from '../../../src/commands/Subscribe';
import Cli from '../../../src/cli/Cli';
import 'jest'

describe('Cli.ts', () => {
  let processExitStub
  let errorStub
  let successList = []
  let logStub

  beforeEach(() => {
    sinon.stub(ora, 'start').callsFake(() => {
      return {
        succeed: text => {
          successList.push(text)
        },
        info: text => {}
      }
    })
    processExitStub = sinon.stub(process, 'exit')
    errorStub = sinon.stub(utils, 'error')
    logStub = sinon.stub(utils, 'log')
    sinon.stub(fs, 'existsSync').callsFake(() => true)
    sinon.stub(fs, 'readFileSync').callsFake(() => {
      return (
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
        '            method: delete'
      )
    })
    sinon.stub(utils, 'createImageName').callsFake(async () => 'image-name')
    sinon.stub(utils.docker, 'ping')
  })

  afterEach(() => {
    successList = []
    ;(ora.start as any).restore()
    ;(process.exit as any).restore()
    ;(utils.error as any).restore()
    ;(utils.log as any).restore()
    ;(fs.existsSync as any).restore()
    ;(fs.readFileSync as any).restore()
    ;(utils.createImageName as any).restore()
    ;(utils.docker.ping as any).restore()
  })

  describe('constructor', () => {
    test('Cli is constructed and the process does not exit', () => {
      new Cli()

      expect(errorStub.called).toBeFalsy()
      expect(processExitStub.called).toBeFalsy()
    })

    test('Cli is not constructed because we are not in a omg directory', () => {
      ;(fs.existsSync as any).restore()
      sinon.stub(fs, 'existsSync').callsFake(() => false)
      const argvStub = sinon.stub(process, 'argv').value([1, 2, 3])
      new Cli()

      // expect(errorStub.calledWith('Must be run in a directory with a `Dockerfile` and a `microservice.yml`')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy()
      argvStub.restore()
    })
  })

  describe('.buildMicroservice()', () => {
    test('builds the microservice', () => {
      const cli = new Cli()
      cli.buildMicroservice()

      expect(errorStub.called).toBeFalsy()
      expect(processExitStub.called).toBeFalsy()
    })

    test('errors out because the `microservice.yml` is not valid', () => {
      (fs.readFileSync as any).restore();
      sinon.stub(fs, 'readFileSync').callsFake(() => 'foo: bar');
      const cli = new Cli();
      cli.buildMicroservice();

      expect(errorStub.calledWith('4 errors found:\n  1. root should NOT have additional properties\n  2. root should have required property \'omg\'\n  3. root should have required property \'info\'\n  4. root should have required property \'health\'')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
    });
  });

  describe('.actionHelp(actionName)', () => {
    test('builds the microservice', () => {
      ;(fs.readFileSync as any).restore()
      sinon.stub(fs, 'readFileSync').callsFake(() => {
        return (
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
          '      command: ["action.sh"]'
        )
      })
      const cli = new Cli()
      cli.buildMicroservice()
      cli.actionHelp('action')

      expect(
        logStub.args[0][0].startsWith('  Action `action` details:')
      ).toBeTruthy()
    })
  })

  describe('Cli.validate(options)', () => {
    describe('valid `microservice.yml`', () => {
      test('silent option', () => {
        Cli.validate({ silent: true })

        expect(logStub.calledWith('')).toBeTruthy()
        expect(processExitStub.calledWith(0)).toBeTruthy()
      })

      test('json option', () => {
        Cli.validate({json: true});

        expect(logStub.calledWith('{\n' +
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
          '}')).toBeTruthy();
        expect(processExitStub.calledWith(0)).toBeTruthy();
      });

      test('no options', () => {
        Cli.validate({})

        expect(logStub.calledWith('No errors')).toBeTruthy()
        expect(processExitStub.calledWith(0)).toBeTruthy()
      })
    })

    describe('invalid `microservice.yml`', () => {
      // we need to make the return value fail the test, and we already stubbed in the layer above this
      // so we need to restore and re-wrap it, then the next layer will restore
      beforeEach(() => {
        ;(fs.readFileSync as any).restore()
        sinon.stub(fs, 'readFileSync').callsFake(() => {
          return 'foo: bar'
        })
      })

      test('silent option', () => {
        Cli.validate({ silent: true })

        expect(errorStub.calledWith('')).toBeTruthy()
        expect(processExitStub.calledWith(1)).toBeTruthy()
      })

      test('json option', () => {
        Cli.validate({json: true});

        expect(errorStub.calledWith('{\n' +
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
          '    },\n' +
          '    {\n' +
          '      "keyword": "required",\n' +
          '      "dataPath": "",\n' +
          '      "schemaPath": "#/required",\n' +
          '      "params": {\n' +
          '        "missingProperty": "health"\n' +
          '      },\n' +
          '      "message": "should have required property \'health\'"\n' +
          '    }\n' +
          '  ],\n' +
          '  "text": "root should NOT have additional properties, root should have required property \'omg\', root should have required property \'info\', root should have required property \'health\'"\n' +
          '}')).toBeTruthy();
        expect(processExitStub.calledWith(1)).toBeTruthy();
      });

      test('no options', () => {
        Cli.validate({});

        expect(errorStub.calledWith('4 errors found:\n  1. root should NOT have additional properties\n  2. root should have required property \'omg\'\n  3. root should have required property \'info\'\n  4. root should have required property \'health\'')).toBeTruthy();
        expect(processExitStub.calledWith(1)).toBeTruthy();
      });
    });
  });

  describe('.build(options)', () => {
    let buildGoStub

    beforeEach(() => {
      sinon.stub(utils, 'exec')
    })

    afterEach(() => {
      ;(utils.exec as any).restore()
    })

    // not able to spy on constructor with sinon yet
    beforeEach(() => {
      buildGoStub = sinon.stub(Build.prototype, 'go')
    })

    afterEach(() => {
      ;(Build.prototype.go as any).restore()
    })

    test('builds with given tag', async () => {
      await Cli.build({ tag: 'tag' })

      expect(buildGoStub.called).toBeTruthy()
      expect(errorStub.called).toBeFalsy()
      expect(processExitStub.called).toBeFalsy()
    })

    test('builds with git remote name', async () => {
      await Cli.build({})

      expect(buildGoStub.called).toBeTruthy()
      expect(errorStub.called).toBeFalsy()
      expect(processExitStub.called).toBeFalsy()
    })
  })

  describe('.run(action, options)', () => {
    let formatRunRunStub

    beforeEach(() => {
      sinon
        .stub(utils.docker, 'listImages')
        .callsFake(async () => [{ RepoTags: ['image'] }])
      sinon
        .stub(FormatRun.prototype, 'startService')
        .callsFake(async () => 'started_id')
      sinon.stub(Run.prototype, 'isRunning').callsFake(async () => true)
      formatRunRunStub = sinon
        .stub(FormatRun.prototype, 'exec')
        .callsFake(async action => 'output')
      sinon
        .stub(Run.prototype, 'stopService')
        .callsFake(async () => 'stoped_id')
    })

    afterEach(() => {
      ;(utils.docker.listImages as any).restore()
      ;(FormatRun.prototype.startService as any).restore()
      ;(Run.prototype.isRunning as any).restore()
      ;(FormatRun.prototype.exec as any).restore()
      ;(Run.prototype.stopService as any).restore()
    })

    test('does not execute action because arguments are not given', async () => {
      const cli = new Cli();
      cli.buildMicroservice();
      await cli.run('action', {});

      expect(errorStub.calledWith('Failed to parse command, run `omg run --help` for more information.')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
      expect(formatRunRunStub.called).toBeFalsy();
    });

    // test('image option given and action is executed', async () => {
    //   (utils.docker.listImages as any).restore();
    //   sinon.stub(utils.docker, 'listImages').callsFake(async () => [{RepoTags: ['image']}]);
    //   const cli = new Cli();
    //   cli.buildMicroservice();
    //   await cli.run('action', {args: [], envs: [], image: 'image'});

    //   expect(successList).toEqual(['Started Docker container: started_id', 'Health check passed', 'Ran action: `action` with output: output', 'Stopped Docker container: stoped_id']);
    //   expect(formatRunRunStub.calledWith('action')).toBeTruthy();
    // });

    test('image option given but is not build so action is not executed', async () => {
      ;(utils.docker.listImages as any).restore()
      sinon
        .stub(utils.docker, 'listImages')
        .callsFake(async () => [{ RepoTags: ['wrong'] }])
      const cli = new Cli()
      cli.buildMicroservice()
      await cli.run('action', { args: [], envs: [], image: 'does-not-exist' })

      expect(
        errorStub.calledWith(
          'Image for microservice is not built. Run `omg build` to build the image.'
        )
      ).toBeTruthy()
      expect(processExitStub.calledWith(1)).toBeTruthy()
      expect(formatRunRunStub.called).toBeFalsy()
    })
  })

  describe('.subscribe(event, options)', () => {
    let cliRunStub
    let subscribeGoStub

    beforeEach(() => {
      cliRunStub = sinon.stub(Cli.prototype, 'run')
      subscribeGoStub = sinon.stub(Subscribe.prototype, 'go')
    })

    afterEach(() => {
      ;(Cli.prototype.run as any).restore()
      ;(Subscribe.prototype.go as any).restore()
    })

    test('subscribes to the event', async () => {
      const cli = new Cli()
      cli.buildMicroservice()
      await cli.subscribe('eventAction', 'event', { args: [], envs: [] })

      expect(cliRunStub.args[0]).toEqual([
        'eventAction',
        { args: [], envs: [] }
      ])
      expect(subscribeGoStub.args[0]).toEqual(['eventAction', 'event'])
    })
  })
})

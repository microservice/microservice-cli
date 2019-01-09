import * as fs from 'fs';
import * as sinon from 'sinon';
import * as utils from '../../../src/utils';
import ora from '../../../src/ora';
import Build from '../../../src/commands/Build';
import Exec from '../../../src/commands/exec/Exec';
import FormatExec from '../../../src/commands/exec/FormatExec';
import Subscribe from '../../../src/commands/Subscribe';
import Cli from '../../../src/cli/Cli';

describe('Cli.ts', () => {
  let processExitStub;
  let errorStub;

  beforeEach(() => {
    sinon.stub(ora, 'start').callsFake(() => {
      return {
        succeed: (text) => {},
        info: (text) => {},
      };
    });
    processExitStub = sinon.stub(process, 'exit');
    errorStub = sinon.stub(utils, 'error');
    sinon.stub(fs, 'existsSync').callsFake(() => true);
    sinon.stub(fs, 'readFileSync').callsFake(() => {
      return 'omg: 1\n' +
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
        '            method: delete';
    });
    sinon.stub(utils, 'createImageName').callsFake(async () => 'image-name');
  });

  afterEach(() => {
    (ora.start as any).restore();
    (process.exit as any).restore();
    (utils.error as any).restore();
    (fs.existsSync as any).restore();
    (fs.readFileSync as any).restore();
    (utils.createImageName as any).restore();
  });

  describe('constructor', () => {
    test('Cli is constructed and the process does not exit', () => {
      new Cli();

      expect(errorStub.called).toBeFalsy();
      expect(processExitStub.called).toBeFalsy();
    });

    test('Cli is not constructed because we are not in a omg directory', () => {
      (fs.existsSync as any).restore();
      sinon.stub(fs, 'existsSync').callsFake(() => false);
      new Cli();

      expect(errorStub.calledWith('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
    });
  });

  describe('.buildMicroservice()', () => {
    test('builds the microservice', () => {
      const cli = new Cli();
      cli.buildMicroservice();

      expect(errorStub.called).toBeFalsy();
      expect(processExitStub.called).toBeFalsy();
    });

    test('errors out because the `microservice.yml` is not valid', () => {
      (fs.readFileSync as any).restore();
      sinon.stub(fs, 'readFileSync').callsFake(() => 'foo: bar');
      const cli = new Cli();
      cli.buildMicroservice();

      expect(errorStub.calledWith('root should NOT have additional properties, root should have required property \'omg\'')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
    });
  });

  describe('Cli.validate(options)', () => {
    let logStub;

    beforeEach(() => {
      logStub = sinon.stub(utils, 'log');
    });

    afterEach(() => {
      (utils.log as any).restore();
    });

    describe('valid `microservice.yml`', () => {
      test('silent option', () => {
        Cli.validate({silent: true});

        expect(logStub.calledWith('')).toBeTruthy();
        expect(processExitStub.calledWith(0)).toBeTruthy();
      });

      test('json option', () => {
        Cli.validate({json: true});

        expect(logStub.calledWith('{\n' +
          '  "valid": true,\n' +
          '  "yaml": {\n' +
          '    "omg": 1,\n' +
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
        Cli.validate({});

        expect(logStub.calledWith('No errors')).toBeTruthy();
        expect(processExitStub.calledWith(0)).toBeTruthy();
      });
    });

    describe('invalid `microservice.yml`', () => {
      // we need to make the return value fail the test, and we already stubbed in the layer above this
      // so we need to restore and re-wrap it, then the next layer will restore
      beforeEach(() => {
        (fs.readFileSync as any).restore();
        sinon.stub(fs, 'readFileSync').callsFake(() => {
          return 'foo: bar';
        });
      });

      test('silent option', () => {
        Cli.validate({silent: true});

        expect(errorStub.calledWith('')).toBeTruthy();
        expect(processExitStub.calledWith(1)).toBeTruthy();
      });

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
          '    }\n' +
          '  ],\n' +
          '  "text": "root should NOT have additional properties, root should have required property \'omg\'"\n' +
          '}')).toBeTruthy();
        expect(processExitStub.calledWith(1)).toBeTruthy();
      });

      test('no options', () => {
        Cli.validate({});

        expect(errorStub.calledWith('root should NOT have additional properties, root should have required property \'omg\'')).toBeTruthy();
        expect(processExitStub.calledWith(1)).toBeTruthy();
      });
    });
  });

  describe('.build(options)', () => {
    let buildGoStub;

    beforeEach(() => {
      sinon.stub(utils, 'exec');
    });

    afterEach(() => {
      (utils.exec as any).restore();
    });

    // not able to spy on constructor with sinon yet
    beforeEach(() => {
      buildGoStub = sinon.stub(Build.prototype, 'go');
    });

    afterEach(() => {
      (Build.prototype.go as any).restore();
    });

    test('builds with given tag', async () => {
      await Cli.build({tag: 'tag'});

      expect(buildGoStub.called).toBeTruthy();
      expect(errorStub.called).toBeFalsy();
      expect(processExitStub.called).toBeFalsy();
    });

    test('builds with git remote name', async () => {
      await Cli.build({});

      expect(buildGoStub.called).toBeTruthy();
      expect(errorStub.called).toBeFalsy();
      expect(processExitStub.called).toBeFalsy();
    });
  });

  describe('.exec(action, options)', () => {
    let formatExecExecStub;
    let utilsExecStub;

    beforeEach(() => {
      formatExecExecStub = sinon.stub(FormatExec.prototype, 'exec');
      utilsExecStub = sinon.stub(utils, 'exec').callsFake(async () => 'image');
      sinon.stub(Exec.prototype, 'isRunning').callsFake(async () => true);
    });

    afterEach(() => {
      (FormatExec.prototype.exec as any).restore();
      (utils.exec as any).restore();
      (Exec.prototype.isRunning as any).restore();
    });

    test('does not execute action because arguments are not given', async () => {
      const cli = new Cli();
      cli.buildMicroservice();
      await cli.exec('action', {});

      expect(errorStub.calledWith('Failed to parse command, run `omg exec --help` for more information.')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
      expect(formatExecExecStub.called).toBeFalsy();
    });

    test('image option given and action is executed', async () => {
      const cli = new Cli();
      cli.buildMicroservice();
      await cli.exec('action', {args: [], envs: [], image: 'image'});

      expect(utilsExecStub.calledWith('docker images -f "reference=image"')).toBeTruthy();
      expect(formatExecExecStub.calledWith('action')).toBeTruthy();
    });

    test('image option given but is not build so action is not executed', async () => {
      const cli = new Cli();
      cli.buildMicroservice();
      await cli.exec('action', {args: [], envs: [], image: 'does-not-exist'});

      expect(errorStub.calledWith('Image for microservice is not built. Run `omg build` to build the image.')).toBeTruthy();
      expect(utilsExecStub.calledWith('docker images -f "reference=does-not-exist"')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
      expect(formatExecExecStub.called).toBeFalsy();
    });
  });

  describe('.subscribe(event, options)', () => {
    let cliExecStub;
    let subscribeGoStub;

    beforeEach(() => {
      cliExecStub = sinon.stub(Cli.prototype, 'exec');
      subscribeGoStub = sinon.stub(Subscribe.prototype, 'go');
    });

    afterEach(() => {
      (Cli.prototype.exec as any).restore();
      (Subscribe.prototype.go as any).restore();
    });

    test('subscribes to the event', async () => {
      const cli = new Cli();
      cli.buildMicroservice();
      await cli.subscribe('eventAction', 'event', {args: [], envs: []});

      expect(cliExecStub.args[0]).toEqual(['eventAction', {args: [], envs: []}]);
      expect(subscribeGoStub.args[0]).toEqual(['eventAction', 'event']);
    });
  });
});

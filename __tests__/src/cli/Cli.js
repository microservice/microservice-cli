const fs = require('fs');
const sinon = require('sinon');
const utils = require('../../../src/utils');
const Microservice = require('../../../src/models/Microservice');
const Cli = require('../../../src/cli/Cli');

describe('Cli.js', () => {
  let processExitStub;
  let errorStub;

  beforeEach(() => {
    processExitStub = sinon.stub(process, 'exit');
    errorStub = sinon.stub(utils, 'error');
    sinon.stub(fs, 'existsSync').callsFake(() => true);
  });

  afterEach(() => {
    process.exit.restore();
    utils.error.restore();
    fs.existsSync.restore();
  });

  describe('constructor', () => {
    test('Cli is constructed and the process does not exit', () => {
      new Cli();

      expect(errorStub.called).toBeFalsy();
      expect(processExitStub.called).toBeFalsy();
    });

    test('Cli is not constructed because we are not in a omg directory', () => {
      fs.existsSync.restore();
      sinon.stub(fs, 'existsSync').callsFake(() => false);
      new Cli();

      expect(errorStub.calledWith('Must be ran in a directory with a `Dockerfile` and a `microservice.yml`')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
    });
  });

  describe('buildMicroservice()', () => {
    beforeEach(() => {
      sinon.stub(fs, 'readFileSync').callsFake(() => {
        return 'omg: 1';
      });
    });

    afterEach(() => {
      fs.readFileSync.restore();
    });

    test('builds the microservice', () => {
      const cli = new Cli();
      cli.buildMicroservice();

      expect(cli._microservice).toEqual(new Microservice({omg: 1}));
      expect(errorStub.called).toBeFalsy();
      expect(processExitStub.called).toBeFalsy();
    });

    test('errors out because the `microservice.yml` is not valid', () => {
      fs.readFileSync.restore();
      sinon.stub(fs, 'readFileSync').callsFake(() => 'foo: bar');
      const cli = new Cli();
      cli.buildMicroservice();

      expect(cli._microservice).toEqual(null);
      expect(errorStub.calledWith('Unable to build microservice. Run `omg validate` for more details')).toBeTruthy();
      expect(processExitStub.calledWith(1)).toBeTruthy();
    });
  });
});

// describe('cli.js', () => {
//   let validateMicroserviceDirectoryStub;
//   let errorStub;
//   let processExitStub;
//
//   beforeEach(() => {
//     validateMicroserviceDirectoryStub = sinon.stub(utils, 'validateMicroserviceDirectory');
//     errorStub = sinon.stub(utils, 'error');
//     processExitStub = sinon.stub(process, 'exit');
//     sinon.stub(utils, 'exec').callsFake(async () => 'image');
//     sinon.stub(utils, 'createImageName').callsFake(async () => 'image-name');
//   });
//
//   afterEach(() => {
//     utils.validateMicroserviceDirectory.restore();
//     utils.error.restore();
//     process.exit.restore();
//     utils.exec.restore();
//     utils.createImageName.restore();
//   });
//
//   describe('validate(options)', () => {
//     let logStub;
//
//     beforeEach(() => {
//       logStub = sinon.stub(utils, 'log');
//     });
//
//     afterEach(() => {
//       utils.log.restore();
//     });
//
//     describe('valid `microservice.yml`', () => {
//       beforeEach(() => {
//         sinon.stub(fs, 'readFileSync').callsFake(() => {
//           return 'omg: 1';
//         });
//       });
//
//       afterEach(() => {
//         fs.readFileSync.restore();
//       });
//
//       test('silent option', () => {
//         cli.validate({silent: true});
//
//         expect(logStub.calledWith('')).toBeTruthy();
//         expect(processExitStub.calledWith(0)).toBeTruthy();
//         expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//       });
//
//       test('no options', () => {
//         cli.validate({});
//
//         expect(logStub.calledWith('No errors')).toBeTruthy();
//         expect(processExitStub.calledWith(0)).toBeTruthy();
//         expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//       });
//     });
//
//     describe('invalid `microservice.yml`', () => {
//       beforeEach(() => {
//         sinon.stub(fs, 'readFileSync').callsFake(() => {
//           return 'foo: bar';
//         });
//       });
//
//       afterEach(() => {
//         fs.readFileSync.restore();
//       });
//       test('silent option', () => {
//         cli.validate({silent: true});
//
//         expect(errorStub.calledWith('')).toBeTruthy();
//         expect(processExitStub.calledWith(1)).toBeTruthy();
//         expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//       });
//
//       test('no options', () => {
//         cli.validate({});
//
//         expect(errorStub.calledWith('root should NOT have additional properties, root should have required property \'omg\'')).toBeTruthy();
//         expect(processExitStub.calledWith(1)).toBeTruthy();
//         expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//       });
//     });
//   });
//
//   // not able to spy on constructor with sinon yet
//   describe('build(options)', () => {
//     let buildGoStub;
//
//     beforeEach(() => {
//       buildGoStub = sinon.stub(Build.prototype, 'go');
//     });
//
//     afterEach(() => {
//       Build.prototype.go.restore();
//     });
//
//     test('builds with given tag', async () => {
//       await cli.build({tag: 'tag'});
//
//       expect(buildGoStub.called).toBeTruthy();
//       expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//     });
//
//     test('builds with git remote name', async () => {
//       await cli.build({});
//
//       expect(buildGoStub.called).toBeTruthy();
//       expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//     });
//
//     test('errors because not tag is given and no git config is present', async () => {
//       utils.createImageName.restore();
//       sinon.stub(utils, 'createImageName').callsFake(async () => {
//         throw 'error';
//       });
//       await cli.build({});
//
//       expect(errorStub.calledWith('The tag flag must be provided because no git config is present. Example: `omg build -t omg/my/service`')).toBeTruthy();
//       expect(processExitStub.calledWith(1)).toBeTruthy();
//       expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//     });
//   });
//
//   describe('exec(action, options)', () => {
//     let execGoStub;
//
//     beforeEach(() => {
//       execGoStub = sinon.stub(Exec.prototype, 'go');
//     });
//
//     afterEach(() => {
//       Exec.prototype.go.restore();
//     });
//
//     test('does not execute action because arguments are not given', async () => {
//       await cli.exec('action', {});
//
//       expect(errorStub.calledWith('Failed to parse command, run `omg exec --help` for more information.')).toBeTruthy();
//       expect(processExitStub.calledWith(1)).toBeTruthy();
//       expect(execGoStub.called).toBeFalsy();
//       expect(validateMicroserviceDirectoryStub.called).toBeFalsy();
//     });
//
//     test('image option given and action is executed', async () => {
//       await cli.exec('action', {args: [], envs: [], image: 'image'});
//
//       expect(execGoStub.calledWith('action')).toBeTruthy();
//       expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//     });
//
//     test('image option given but is not build so action is not executed', async () => {
//       utils.exec.restore();
//       sinon.stub(utils, 'exec').callsFake(async () => '');
//       await cli.exec('action', {args: [], envs: [], image: 'image'});
//
//       expect(errorStub.calledWith('Image for microservice is not built. Run `omg build` to build the image.')).toBeTruthy();
//       expect(processExitStub.calledWith(1)).toBeTruthy();
//       expect(execGoStub.called).toBeFalsy();
//       expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//     });
//
//     test('executes the given action', async () => {
//       await cli.exec('action', {args: [], envs: []});
//
//       expect(execGoStub.calledWith('action')).toBeTruthy();
//       expect(validateMicroserviceDirectoryStub.called).toBeTruthy();
//     });
//   });
// });

import * as sinon from 'sinon';
import * as utils from '../../../src/utils';
import Build from '../../../src/commands/Build';

describe('Build.ts', () => {
  describe('.go()', () => {
    let execStub;

    beforeEach(() => {
      execStub = sinon.stub(utils, 'exec');
    });

    afterEach(() => {
      (utils.exec as any).restore();
    });

    test('constructor', () => {
      const obj = new Build('image')
      expect(obj).toBeTruthy()
    })

    // test('Builds the Docker image and logs what is happening', async () => {
    //   await new Build('name').go();

    //   expect(execStub.calledWith('docker build -t name .')).toBeTruthy();
    // });

    // test('throws an error because the image could not be build for some reason', async () => {
    //   (utils.exec as any).restore();
    //   execStub = sinon.stub(utils, 'exec').callsFake(async () => {
    //     throw 'Unable to build Docker image';
    //   });
    //   try {
    //     await new Build('name').go();
    //   } catch (e) {
    //     expect(e).toBe('Unable to build Docker image');
    //   }
    // });
  });
});

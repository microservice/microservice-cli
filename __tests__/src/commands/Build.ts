import * as sinon from 'sinon';
import ora from '../../../src/ora';
import * as utils from '../../../src/utils';
import Build from '../../../src/commands/Build';

describe('Build.ts', () => {
  describe('.go()', () => {
    let successTextList = [];
    let execStub;
    let oraStartStub;

    beforeEach(() => {
      execStub = sinon.stub(utils, 'exec');
      oraStartStub = sinon.stub(ora, 'start').callsFake(() => {
        return {
          succeed: (text) => {
            successTextList.push(text);
          },
        };
      });
    });

    afterEach(() => {
      (utils.exec as any).restore();
      (ora.start as any).restore();
      successTextList = [];
    });

    test('Builds the Docker image and logs what is happening', async () => {
      await new Build('name').go();

      expect(oraStartStub.calledWith('Building Docker image')).toBeTruthy();
      expect(execStub.calledWith('docker build -t name .')).toBeTruthy();
      expect(successTextList).toEqual(['Built Docker image with name: name']);
    });

    test('throws an error because the image could not be build for some reason', async () => {
      (utils.exec as any).restore();
      execStub = sinon.stub(utils, 'exec').callsFake(async () => {
        throw 'Unable to build Docker image';
      });
      try {
        await new Build('name').go();
      } catch (e) {
        expect(e.spinner).toBeTruthy();
        expect(e.message).toBe('Unable to build Docker image');
      }
    });
  });
});

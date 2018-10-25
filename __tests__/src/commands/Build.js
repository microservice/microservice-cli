const sinon = require('sinon');
const ora = require('../../../src/ora');
const utils = require('../../../src/utils');
const Build = require('../../../src/commands/Build');

describe('Build.js', () => {
  describe('constructor()', () => {
    test('sets the name', () => {
      expect(new Build('name')._name).toBe('name');
    });
  });

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
      utils.exec.restore();
      ora.start.restore();
      successTextList = [];
    });

    test('Builds the Docker image and logs what is happening', async () => {
      await new Build('name').go();

      expect(oraStartStub.calledWith('Building Docker image')).toBeTruthy();
      expect(execStub.calledWith('docker build -t name .')).toBeTruthy();
      expect(successTextList).toEqual(['Built Docker image with name: name']);
    });

    test('throws an error because the image could not be build for some reason', async () => {
      utils.exec.restore();
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

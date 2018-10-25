const fs = require('fs');
const sinon = require('sinon');
const ora = require('../../../src/ora');
const Subscribe = require('../../../src/commands/Subscribe');
const Microservice = require('../../../src/models/Microservice');

describe('Subscribe.js', () => {
  let successTextList = [];
  let oraStartStub;

  beforeEach(() => {
    oraStartStub = sinon.stub(ora, 'start').callsFake(() => {
      return {
        succeed: (text) => {
          successTextList.push(text);
        },
      };
    });
    sinon.stub(fs, 'existsSync').callsFake(() => true);
    sinon.stub(fs, 'readFileSync');
    sinon.stub(JSON, 'parse').callsFake(() => {
      return {
        'path/to/omg/directory': {},
      };
    });
    sinon.stub(process, 'cwd').callsFake(() => 'path/to/omg/directory');
  });

  afterEach(() => {
    ora.start.restore();
    fs.existsSync.restore();
    fs.readFileSync.restore();
    JSON.parse.restore();
    process.cwd.restore();
  });

  describe('.go(event)', () => {
    test('fails because the `.omg.json` file does not exist', async () => {
      fs.existsSync.restore();
      sinon.stub(fs, 'existsSync').callsFake(() => false);
      try {
        await new Subscribe(new Microservice({omg: 1}), {}).go('event');
      } catch (e) {
        expect(oraStartStub.calledWith('Subscribing to event: `event`'));
        expect(e.spinner).toBeTruthy();
        expect(e.message).toBe('Failed subscribing to event: `event`. You must run `omg exec `action_for_event`` before trying to subscribe to an event');
      }
    });

    test('fails because there is no path entry in the `.omg.json` file where this command is being ran', async () => {
      process.cwd.restore();
      sinon.stub(process, 'cwd').callsFake(() => 'wrong/path');

      try {
        await new Subscribe(new Microservice({omg: 1}), {}).go('event');
      } catch (e) {
        expect(oraStartStub.calledWith('Subscribing to event: `event`'));
        expect(e.spinner).toBeTruthy();
        expect(e.message).toBe('Failed subscribing to event: `event`. You must run `omg exec `action_for_event`` before trying to subscribe to an event');
      }
    });

    test('fails because required arguments are not supplied', async () => {

    });
  });
});

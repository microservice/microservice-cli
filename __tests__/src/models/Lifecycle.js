const Lifecycle = require('../../../src/models/Lifecycle');

describe('Lifecycle.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Lifecycle({});
      } catch (e) {
        expect(e).toEqual(
          {
            errors: [{
              dataPath: '',
              keyword: 'required',
              message: 'should have required property \'startup\'',
              params: {missingProperty: 'startup'},
              schemaPath: '#/oneOf/0/required',
            }, {
              dataPath: '',
              keyword: 'required',
              message: 'should have required property \'shutdown\'',
              params: {missingProperty: 'shutdown'},
              schemaPath: '#/oneOf/1/required',
            }, {
              dataPath: '',
              keyword: 'oneOf',
              message: 'should match exactly one schema in oneOf',
              params: {passingSchemas: null},
              schemaPath: '#/oneOf',
            }],
            issue: {},
            text: 'lifecycle should have required property \'startup\', data should have required property \'shutdown\', data should match exactly one schema in oneOf',
            valid: false,
          }
        );
      }
    });
  });
  describe('.startup', () => {
    test('gets the startup', () => {
      const l = new Lifecycle({
        startup: {
          command: ['node', 'app.js', 'foo'],
        },
      });

      expect(l.startup).toBe('node app.js foo');
    });
  });

  describe('.shutdown', () => {
    test('gets the shutdown', () => {
      const l = new Lifecycle({
        shutdown: {
          command: 'bye.sh',
          timeout: 100,
        },
      });

      expect(l.shutdown).toEqual({
        command: 'bye.sh',
        timeout: 100,
      });
    });
  });
});

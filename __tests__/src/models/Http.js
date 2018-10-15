const Http = require('../../../src/models/Http');

describe('Https.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Http('commandName', {}, 'actions.commandName.http');
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'method\'',
            params: {missingProperty: 'method'},
            schemaPath: '#/required',
          }, {
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'port\'',
            params: {missingProperty: 'port'},
            schemaPath: '#/required',
          }, {
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'path\'',
            params: {missingProperty: 'path'},
            schemaPath: '#/required',
          }],
          issue: {},
          text: 'actions.commandName.http should have required property \'method\', actions.commandName.http should have required property \'port\', actions.commandName.http should have required property \'path\'',
          valid: false,
        });
      }
    });

    test('throws an exception because the json is not valid', () => {
      try {
        new Http('commandName', {method: 'get'}, 'actions.commandName.http');
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'port\'',
            params: {missingProperty: 'port'},
            schemaPath: '#/required',
          }, {
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'path\'',
            params: {missingProperty: 'path'},
            schemaPath: '#/required',
          }],
          issue: {method: 'get'},
          text: 'actions.commandName.http should have required property \'port\', actions.commandName.http should have required property \'path\'',
          valid: false,
        });
      }
    });
  });

  describe('.method', () => {
    test('gets the method', () => {
      const h = new Http('commandName', {method: 'post', port: 5000, path: '/skrt'});

      expect(h.method).toBe('post');
    });
  });

  describe('.port', () => {
    test('gets the method', () => {
      const h = new Http('commandName', {method: 'post', port: 5000, path: '/skrt'});

      expect(h.port).toBe(5000);
    });
  });

  describe('.path', () => {
    test('gets the path', () => {
      const h = new Http('commandName', {method: 'post', port: 5000, path: '/skrt'});

      expect(h.path).toBe('/skrt');
    });
  });
});

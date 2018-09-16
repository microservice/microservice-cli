const Http = require('../../../src/models/Http');

describe('Https.js', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Http('commandName', {});
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
            message: 'should have required property \'path\'',
            params: {missingProperty: 'path'},
            schemaPath: '#/required',
          }],
          issue: {},
          text: 'commands.commandName.http should have required property \'method\', data should have required property \'path\'',
          valid: false,
        });
      }
    });

    test('throws an exception because the json is not valid', () => {
      try {
        new Http('commandName', {method: 'get'});
      } catch (e) {
        expect(e).toEqual({
          errors: [{
            dataPath: '',
            keyword: 'required',
            message: 'should have required property \'path\'',
            params: {missingProperty: 'path'},
            schemaPath: '#/required',
          }],
          issue: {method: 'get'},
          text: 'commands.commandName.http should have required property \'path\'',
          valid: false,
        });
      }
    });
  });

  describe('.method', () => {
    test('gets the method', () => {
      const h = new Http('commandName', {method: 'post', path: '/skrt'});

      expect(h.method).toBe('post');
    });
  });

  describe('.path', () => {
    test('gets the path', () => {
      const h = new Http('commandName', {method: 'post', path: '/skrt'});

      expect(h.path).toBe('/skrt');
    });
  });
});

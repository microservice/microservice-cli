const Http = require('../../src/Http');

describe('Https.js', () => {
  describe('constructor', () => {
    test('throws an exception because no method is given', () => {
      try {
        new Http({});
      } catch (e) {
        expect(e).toBe('An Http must be provided a method');
      }
    });

    test('throws an exception because no endpoint is given', () => {
      try {
        new Http({method: 'get'});
      } catch (e) {
        expect(e).toBe('An Http must be provided an endpoint');
      }
    });

    test('throws an exception because the method is no one of `get,post,put,delete`', () => {
      try {
        new Http({
          method: 'skrt',
          endpoint: '/data',
        });
      } catch (e) {
        expect(e).toBe('The Http method must be one of `get,post,put,delete`');
      }
    });
  });

  describe('.method', () => {
    test('gets the method', () => {
      const h = new Http({method: 'post', endpoint: '/skrt'});

      expect(h.method).toBe('post');
    });
  });

  describe('.endpoint', () => {
    test('gets the endpoint', () => {
      const h = new Http({method: 'post', endpoint: '/skrt'});

      expect(h.endpoint).toBe('/skrt');
    });
  });
});

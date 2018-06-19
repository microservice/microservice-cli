const Http = require('../../src/Http');

describe('Https.js', () => {
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

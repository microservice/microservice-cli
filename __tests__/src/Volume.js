const Volume = require('../../src/Volume');

describe('Volume.js', () => {
  describe('constructor', () => {
    test('throws an exception because no target is given', () => {
      try {
        new Volume('name', {});
      } catch (e) {
        expect(e).toBe('A Volume must be provide a target');
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const v = new Volume('vol', {target: '/data'});

      expect(v.name).toBe('vol');
    });
  });

  describe('.target', () => {
    test('gets the target', () => {
      const v = new Volume('vol', {target: '/data'});

      expect(v.target).toBe('/data');
    });
  });

  describe('.doesPersist()', () => {
    test('checks if it persists', () => {
      const v1 = new Volume('vol', {target: '/data'});
      const v2 = new Volume('vol', {target: '/data', persist: true});

      expect(v1.doesPersist()).toBeFalsy();
      expect(v2.doesPersist()).toBeTruthy();
    });
  });
});

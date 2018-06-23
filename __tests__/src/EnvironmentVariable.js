const EnvironmentVariable = require('../../src/EnvironmentVariable');

describe('EnvironmentVariable.js', () => {
  describe('constructor', () => {
    test('throws an exception because no type is given', () => {
      try {
        new EnvironmentVariable('name', {});
      } catch (e) {
        expect(e).toBe('An EnvironmentVariable must be provided a type');
      }
    });

    test('throws an exception because the type is no one of `int,float,string,uuid,list,map,boolean,path`', () => {
      try {
        new EnvironmentVariable('name', {
          type: 'bob',
        });
      } catch (e) {
        expect(e).toBe('The EnvironmentVariable type must be one of `int,float,string,uuid,list,map,boolean,path`');
      }
    });
  });

  describe('.name', () => {
    test('gets the name', () => {
      const e = new EnvironmentVariable('TOKEN', {type: 'string'});

      expect(e.name).toBe('TOKEN');
    });
  });

  describe('.type', () => {
    test('gets the target', () => {
      const e = new EnvironmentVariable('TOKEN', {type: 'string'});

      expect(e.type).toBe('string');
    });
  });

  describe('.pattern', () => {
    test('gets the pattern', () => {
      const e = new EnvironmentVariable('TOKEN', {type: 'string', pattern: 'w'});

      expect(e.pattern).toBe('w');
    });
  });

  describe('.isRequired()', () => {
    test('checks if it is required', () => {
      const e1 = new EnvironmentVariable('TOKEN', {type: 'string'});
      const e2 = new EnvironmentVariable('TOKEN', {type: 'string', required: true});

      expect(e1.isRequired()).toBeFalsy();
      expect(e2.isRequired()).toBeTruthy();
    });
  });

  describe('.default', () => {
    test('gets the pattern', () => {
      const e = new EnvironmentVariable('TOKEN', {type: 'string', default: '*****'});

      expect(e.default).toBe('*****');
    });
  });

  describe('.help', () => {
    test('gets the help', () => {
      const e = new EnvironmentVariable('TOKEN', {type: 'string', help: 'token for stuff'});

      expect(e.help).toBe('token for stuff');
    });
  });
});

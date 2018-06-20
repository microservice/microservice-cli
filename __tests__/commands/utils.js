const utils = require('../../commands/utils');

describe('utils.js', () => {
  describe('parse(list, delimiter, errorMessage)', () => {
    test('parses the list', () => {
      const result = utils.parse(['key:val', 'foo:bar', 'fizz:buzz'], ':', 'Error message.');

      expect(result).toEqual({
        key: 'val',
        foo: 'bar',
        fizz: 'buzz',
      });
    });

    test('errors because delimiter is not present in on of the elements', () => {
      try {
        utils.parse(['key:val', 'foo:bar', 'fizz=buzz'], ':', 'Error message.');
      } catch (e) {
        expect(e).toEqual({message: 'Error message.'});
      }
    });
  });

  describe('stringifyContainerOutput(data)', () => {
    test('stringifies an object', () => {
      const output = utils.stringifyContainerOutput({
        foo: 'bar',
      });

      expect(output).toBe('{\n' +
                          '  "foo": "bar"\n' +
                          '}');
    });
  });

  describe('exec(command)', () => {
    test('runs a command', async (done) => {
      const result = await utils.exec('echo skrt');

      expect(result).toBe('skrt');
      done();
    });

    test('errors a command', async (done) => {
      try {
        await utils.exec('skrt');
      } catch (e) {
        expect(e).toBe('/bin/sh: skrt: command not found');
        done();
      }
    });
  });

  describe('{ typeCast }', () => {
    test('casts an integer', () => {
      expect(typeof utils.typeCast['int']('20')).toBe('number');
    });

    test('casts a float', () => {
      expect(typeof utils.typeCast['float']('20.20')).toBe('number');
    });

    test('casts a string', () => {
      expect(typeof utils.typeCast['string']('test')).toBe('string');
    });

    test('casts a uuid', () => {
      expect(typeof utils.typeCast['uuid']('2d9eb156-d047-428a-b5c1-b1b6c55e56ab')).toBe('string');
    });

    test('casts a list', () => {
      expect(typeof utils.typeCast['list']('["val"]')).toBe('object');
    });

    test('cast an object', () => {
      expect(typeof utils.typeCast['object']('{"key": "val"}')).toBe('object');
    });

    test('cast a boolean', () => {
      expect(typeof utils.typeCast['boolean']('true')).toBe('boolean');
    });

    test('cast a path', () => {
      expect(typeof utils.typeCast['path']('/path')).toBe('string');
    });
  });

  describe('{ dataTypes }', () => {
    test('type checks a stringified integer', () => {
      expect(utils.dataTypes['int']('20')).toBeTruthy();
      expect(utils.dataTypes['int']('20.2')).toBeFalsy();
      expect(utils.dataTypes['int']('asd')).toBeFalsy();
    });

    test('type checks a stringified float', () => {
      expect(utils.dataTypes['float']('20.20')).toBeTruthy();
      expect(utils.dataTypes['float']('20')).toBeFalsy();
      expect(utils.dataTypes['float']('asd')).toBeFalsy();
    });

    test('type checks a stringified string', () => {
      expect(utils.dataTypes['string']('any')).toBeTruthy();
    });

    test('type checks a stringified uuid', () => {
      expect(utils.dataTypes['uuid']('db3a6ed8-5419-4c35-8640-1e46ef27f94d')).toBeTruthy();
      expect(utils.dataTypes['uuid']('db3a6')).toBeFalsy();
    });

    test('type checks a stringified list', () => {
      expect(utils.dataTypes['list']('["data"]')).toBeTruthy();
      expect(utils.dataTypes['list']('{"data": "value"}')).toBeFalsy();
      expect(utils.dataTypes['list']('asd')).toBeFalsy();
    });

    test('type checks a stringified object', () => {
      expect(utils.dataTypes['object']('{"data": "value"}')).toBeTruthy();
      expect(utils.dataTypes['object']('["data"]')).toBeFalsy();
      expect(utils.dataTypes['object']('asd')).toBeFalsy();
    });

    test('type checks a stringified boolean', () => {
      expect(utils.dataTypes['boolean']('true')).toBeTruthy();
      expect(utils.dataTypes['boolean']('false')).toBeTruthy();
      expect(utils.dataTypes['boolean']('{"data": "value"}')).toBeFalsy();
      expect(utils.dataTypes['boolean']('asd')).toBeFalsy();
    });

    test('type checks a stringified path', () => {
      expect(utils.dataTypes['path']('/path')).toBeTruthy();
      expect(utils.dataTypes['path']('dataPath')).toBeTruthy();
      expect(utils.dataTypes['path']('{"data": "value"}')).toBeFalsy();
    });
  });

  describe('getOpenPort()', () => {
    test('gets an open port', async (done) => {
      const port = await utils.getOpenPort();

      expect(port <= 17000).toBeTruthy();
      expect(port >= 2000).toBeTruthy();
      done();
    });
  });
});

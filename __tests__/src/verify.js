const verify = require('../../src/verify');
const Command = require('../../src/models/Command');
const Microservice = require('../../src/models/Microservice');

describe('verify.js', () => {
  describe('verifyArgumentConstrains(command, args)', () => {
    test('throws an exception because an argument does not match its defined pattern', () => {
      try {
        verify.verifyArgumentConstrains(new Command('name', {
          output: {type: 'string'},
          arguments: {
            foo: {
              type: 'string',
              pattern: 'word',
            },
          },
        }), {
          foo: 'letter',
        });
      } catch (e) {
        expect(e).toBe('Argument: `foo` must match regex: `word`');
      }
    });

    test('throws an exception because an argument is not an element of its defined enum', () => {
      try {
        verify.verifyArgumentConstrains(new Command('name', {
          output: {type: 'string'},
          arguments: {
            foo: {
              type: 'string',
              enum: ['one', 'two', 'three'],
            },
          },
        }), {
          foo: 'four',
        });
      } catch (e) {
        expect(e).toBe('Argument: `foo` must be one of: `one,two,three`');
      }
    });

    test('throws an exception because an argument is lower that min value', () => {
      try {
        verify.verifyArgumentConstrains(new Command('name', {
          output: {type: 'string'},
          arguments: {
            foo: {
              type: 'string',
              range: {
                min: 0,
              },
            },
          },
        }), {
          foo: -1,
        });
      } catch (e) {
        expect(e).toBe('Argument: `foo` must be be no smaller than the value: `0`');
      }
    });

    test('throws an exception because an argument is larger that max value', () => {
      try {
        verify.verifyArgumentConstrains(new Command('name', {
          output: {type: 'string'},
          arguments: {
            foo: {
              type: 'string',
              range: {
                max: 100,
              },
            },
          },
        }), {
          foo: 101,
        });
      } catch (e) {
        expect(e).toBe('Argument: `foo` must be be no larger than the value: `100`');
      }
    });
  });

  describe('verifyArgumentTypes(command, args)', () => {
    test('throws an exception because an argument is not of the right type', () => {
      try {
        verify.verifyArgumentTypes(new Command('name', {
          output: {type: 'map'},
          arguments: {
            foo: {
              type: 'string',
            },
            bar: {
              type: 'int',
            },
          },
        }), {
          foo: 'data',
          bar: '12.12',
        });
      } catch (e) {
        expect(e).toBe('Argument: `bar` must be of type: `int`');
      }
    });
  });

  describe('verifyEnvironmentVariableTypes(microservice, envs)', () => {
    test('throws an exception because an environment variable is not of the right type', () => {
      try {
        verify.verifyEnvironmentVariableTypes(new Microservice({
          environment: {
            foo: {
              type: 'int',
            },
          },
        }), {
          foo: 'skrt',
        });
      } catch (e) {
        expect(e).toBe('Environment variable: `foo` must be of type: `int`');
      }
    });
  });

  describe('verifyEnvironmentVariablePattern(microservice, envs)', () => {
    test('throws an exception because an environment variable does not match its defined pattern', () => {
      try {
        verify.verifyEnvironmentVariablePattern(new Microservice({
          environment: {
            foo: {
              type: 'string',
              pattern: 'word',
            },
          },
        }), {
          foo: 'letter',
        });
      } catch (e) {
        expect(e).toBe('Environment variable: `foo` must match regex: `word`');
      }
    });
  });

  describe('verifyOutputType(command, output)', () => {
    test('throws an exception because the output is not of the right type', () => {
      try {
        verify.verifyOutputType(new Command('name', {
          output: {type: 'map'},
        }), 'bob');
      } catch (e) {
        expect(e).toBe('Command: `name` must have output type: `map`');
      }
    });
  });
});

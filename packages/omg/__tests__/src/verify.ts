import { Action, Microservice } from 'omg-validate'
import * as verify from '../../src/verify'

describe('verify.ts', () => {
  describe('verifyArgumentConstrains(command, args)', () => {
    test('throws an exception because an argument does not match its defined pattern', () => {
      try {
        verify.verifyArgumentConstrains(
          new Action('name', {
            output: { type: 'string' },
            format: {
              command: 'name.sh',
            },
            arguments: {
              foo: {
                type: 'string',
                pattern: 'word',
              },
            },
          }),
          {
            foo: 'letter',
          },
        )
      } catch (e) {
        expect(e).toBe('Argument: `foo` must match regex: `word`')
      }
    })

    test('throws an exception because an argument is not an element of its defined enum', () => {
      try {
        verify.verifyArgumentConstrains(
          new Action('name', {
            output: { type: 'string' },
            format: {
              command: 'name.sh',
            },
            arguments: {
              foo: {
                type: 'string',
                enum: ['one', 'two', 'three'],
              },
            },
          }),
          {
            foo: 'four',
          },
        )
      } catch (e) {
        expect(e).toBe('Argument: `foo` must be one of: `one,two,three`')
      }
    })

    test('throws an exception because an argument is lower that min value', () => {
      try {
        verify.verifyArgumentConstrains(
          new Action('name', {
            output: { type: 'string' },
            format: {
              command: 'name.sh',
            },
            arguments: {
              foo: {
                type: 'string',
                range: {
                  min: 0,
                },
              },
            },
          }),
          {
            foo: -1,
          },
        )
      } catch (e) {
        expect(e).toBe('Argument: `foo` must be be no smaller than the value: `0`')
      }
    })

    test('throws an exception because an argument is larger that max value', () => {
      try {
        verify.verifyArgumentConstrains(
          new Action('name', {
            output: { type: 'string' },
            format: {
              command: 'name.sh',
            },
            arguments: {
              foo: {
                type: 'string',
                range: {
                  max: 100,
                },
              },
            },
          }),
          {
            foo: 101,
          },
        )
      } catch (e) {
        expect(e).toBe('Argument: `foo` must be be no larger than the value: `100`')
      }
    })
  })

  describe('verifyArgumentTypes(command, args)', () => {
    test('throws an exception because an argument is not of the right type', () => {
      try {
        verify.verifyArgumentTypes(
          new Action('name', {
            output: { type: 'map' },
            format: {
              command: 'name.sh',
            },
            arguments: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'int',
              },
            },
          }),
          {
            foo: 'data',
            bar: '12.12',
          },
        )
      } catch (e) {
        expect(e).toBe('Argument: `bar` must be of type: `int`')
      }
    })
  })

  describe('verifyEnvironmentVariableTypes(microservice, envs)', () => {
    test('throws an exception because an environment variable is not of the right type', () => {
      try {
        verify.verifyEnvironmentVariableTypes(
          new Microservice({
            omg: 1,
            info: {
              version: '1.0.0',
              title: 'test',
              description: 'for tests',
            },
            health: {
              http: {
                path: '/health',
                port: 5000,
              },
            },
            environment: {
              foo: {
                type: 'int',
              },
            },
          }),
          {
            foo: 'skrt',
          },
        )
      } catch (e) {
        expect(e).toBe('Environment variable: `foo` must be of type: `int`')
      }
    })
  })

  describe('verifyEnvironmentVariablePattern(microservice, envs)', () => {
    test('throws an exception because an environment variable does not match its defined pattern', () => {
      try {
        verify.verifyEnvironmentVariablePattern(
          new Microservice({
            omg: 1,
            info: {
              version: '1.0.0',
              title: 'test',
              description: 'for tests',
            },
            health: {
              http: {
                path: '/health',
                port: 5000,
              },
            },
            environment: {
              foo: {
                type: 'string',
                pattern: 'word',
              },
            },
          }),
          {
            foo: 'letter',
          },
        )
      } catch (e) {
        expect(e).toBe('Environment variable: `foo` must match regex: `word`')
      }
    })
  })

  describe('verifyOutputType(command, output)', () => {
    test('throws an exception because the output is not of the right type', () => {
      try {
        verify.verifyOutputType(
          new Action('name', {
            format: {
              command: 'name.sh',
            },
            output: { type: 'map' },
          }),
          'bob',
        )
      } catch (e) {
        expect(e).toBe('Action: `name` must have output type: `map` instead got: `string` bob')
      }
    })
  })

  describe('verifyProperties(command, output)', () => {
    test('succeeds in verifying a boolean output property with value false', () => {
      expect(
        verify.verifyProperties(
          new Action('name', {
            format: {
              command: 'name.sh',
            },
            output: {
              type: 'object',
              properties: {
                falsey: {
                  type: 'boolean',
                },
              },
            },
          }),
          '{"falsey": false}',
        ),
      ).toBeUndefined() // i.e. not to throw
    })
  })
})

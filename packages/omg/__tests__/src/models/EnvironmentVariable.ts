import { EnvironmentVariable } from 'omg-validate'

describe('EnvironmentVariable.ts', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new EnvironmentVariable('name', {})
      } catch (e) {
        expect(e).toEqual({
          errors: [
            {
              dataPath: '',
              keyword: 'required',
              message: 'should have required property \'type\'',
              params: { missingProperty: 'type' },
              schemaPath: '#/required'
            }
          ],
          issue: {},
          text: 'environment.name should have required property \'type\'',
          valid: false
        })
      }
    })

    test('throws an exception because the json is not valid', () => {
      try {
        new EnvironmentVariable('name', {
          type: 'bob'
        })
      } catch (e) {
        expect(e).toEqual({
          errors: [
            {
              dataPath: '.type',
              keyword: 'pattern',
              message:
                'should match pattern "^(number|int|float|string|uuid|list|map|boolean|path|any|object)$"',
              params: {
                pattern:
                  '^(number|int|float|string|uuid|list|map|boolean|path|any|object)$'
              },
              schemaPath: '#/properties/type/pattern'
            }
          ],
          issue: { type: 'bob' },
          text:
            'environment.name.type should match pattern "^(number|int|float|string|uuid|list|map|boolean|path|any|object)$"',
          valid: false
        })
      }
    })
  })

  describe('.name', () => {
    test('gets the name', () => {
      const e = new EnvironmentVariable('TOKEN', { type: 'string' })

      expect(e.name).toBe('TOKEN')
    })
  })

  describe('.type', () => {
    test('gets the target', () => {
      const e = new EnvironmentVariable('TOKEN', { type: 'string' })

      expect(e.type).toBe('string')
    })
  })

  describe('.pattern', () => {
    test('gets the pattern', () => {
      const e = new EnvironmentVariable('TOKEN', {
        type: 'string',
        pattern: 'w'
      })

      expect(e.pattern).toBe('w')
    })
  })

  describe('.isRequired()', () => {
    test('checks if it is required', () => {
      const e1 = new EnvironmentVariable('TOKEN', { type: 'string' })
      const e2 = new EnvironmentVariable('TOKEN', {
        type: 'string',
        required: true
      })

      expect(e1.isRequired()).toBeFalsy()
      expect(e2.isRequired()).toBeTruthy()
    })
  })

  describe('.default', () => {
    test('gets the pattern', () => {
      const e = new EnvironmentVariable('TOKEN', {
        type: 'string',
        default: '*****'
      })

      expect(e.default).toBe('*****')
    })
  })

  describe('.help', () => {
    test('gets the help', () => {
      const e = new EnvironmentVariable('TOKEN', {
        type: 'string',
        help: 'token for stuff'
      })

      expect(e.help).toBe('token for stuff')
    })
  })
})

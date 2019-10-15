import { Http } from 'oms-validate'

describe('Https.ts', () => {
  describe('constructor', () => {
    test('throws an exception because the json is not valid', () => {
      try {
        new Http('commandName', {}, 'actions.actionName.http')
      } catch (e) {
        expect(e).toEqual({
          errors: [
            {
              dataPath: '',
              keyword: 'required',
              message: "should have required property 'method'",
              params: { missingProperty: 'method' },
              schemaPath: '#/required',
            },
            {
              dataPath: '',
              keyword: 'required',
              message: "should have required property 'port'",
              params: { missingProperty: 'port' },
              schemaPath: '#/required',
            },
            {
              dataPath: '',
              keyword: 'required',
              message: "should have required property 'path'",
              params: { missingProperty: 'path' },
              schemaPath: '#/required',
            },
          ],
          issue: {},
          text:
            "actions.actionName.http should have required property 'method', actions.actionName.http should have required property 'port', actions.actionName.http should have required property 'path'",
          valid: false,
        })
      }
    })

    test('throws an exception because the json is not valid', () => {
      try {
        new Http('commandName', { method: 'get' }, 'actions.actionName.http')
      } catch (e) {
        expect(e).toEqual({
          errors: [
            {
              dataPath: '',
              keyword: 'required',
              message: "should have required property 'port'",
              params: { missingProperty: 'port' },
              schemaPath: '#/required',
            },
            {
              dataPath: '',
              keyword: 'required',
              message: "should have required property 'path'",
              params: { missingProperty: 'path' },
              schemaPath: '#/required',
            },
          ],
          issue: { method: 'get' },
          text:
            "actions.actionName.http should have required property 'port', actions.actionName.http should have required property 'path'",
          valid: false,
        })
      }
    })
  })

  describe('.method', () => {
    test('gets the method', () => {
      const h = new Http('commandName', { method: 'post', port: 5000, path: '/skrt' }, 'actions.actionName.http')

      expect(h.method).toBe('post')
    })
  })

  describe('.port', () => {
    test('gets the method', () => {
      const h = new Http('commandName', { method: 'post', port: 5000, path: '/skrt' }, 'actions.actionName.http')

      expect(h.port).toBe(5000)
    })
  })

  describe('.path', () => {
    test('gets the path', () => {
      const h = new Http('commandName', { method: 'post', port: 5000, path: '/skrt' }, 'action.actionName.http')

      expect(h.path).toBe('/skrt')
    })
  })
})

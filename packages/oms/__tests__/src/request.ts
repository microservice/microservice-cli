import { makeRequest } from '~/request'

describe('request.ts', () => {
  describe('makeRequest(data)', () => {
    test('returns a Promise', () => {
      expect(makeRequest('https://google.com')).toBeTruthy()
    })
  })
})

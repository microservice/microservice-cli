import * as rp from 'request-promise'

/**
 * Thin wrapper over rp so it can be mocked in tests.
 *
 * @param {Object} data The given data to request
 * @return {Promise<void>} The data after request
 */
export async function makeRequest(data: any): Promise<any> {
  return await rp(data)
}

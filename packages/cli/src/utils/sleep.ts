/**
 * @param  {number} ms Time to sleep in milliseconds
 * @return {Promise} Promise to await
 */
export default function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Used to append the environment variable options into [args...].
 *
 * @param {Array} xs
 * @return {function(*=): (*|Array)}
 */
export default function appender(givenXs: any[] = []): (...args: any) => any {
  const xs = givenXs || []
  return x => {
    xs.push(x)
    return xs
  }
}

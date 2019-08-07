/**
 * Log a string to stderr.
 *
 * @param {String} string The given string to log
 */
export default function error(string) {
  process.stderr.write(`${string}\n`)
}

/**
 * Log a string to stdout.
 *
 * @param {String} string The given sting to log
 */
export default function log(string: string) {
  process.stdout.write(`${string}\n`)
}

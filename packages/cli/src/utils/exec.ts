import $ from 'shelljs'

/**
 * Promise wrapper for the `exec`.
 *
 * @param {String} command The command to run
 * @param {Boolean} [silent=true] True if silent, otherwise false
 * @return {Promise<String>} The stdout if resolved, otherwise stderror unless stderror is empty
 */
export default function exec(command: string, silent: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    $.exec(command, { silent }, (code, stdout, stderr) => {
      if (code !== 0) {
        if (stderr === '') {
          reject(stdout.trim())
        } else {
          reject(stderr.trim())
        }
      } else if (stdout === '') {
        resolve(stderr.trim())
      } else {
        resolve(stdout.trim())
      }
    })
  })
}

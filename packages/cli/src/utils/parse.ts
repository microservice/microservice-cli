/**
 * Turns a list of string with a delimiter to a map.
 *
 * @param {Array<String>} list The given list of strings with delimiter
 * @param {String} errorMessage The given message to used when unable to parse
 * @return {Object} Key value of the list
 */
export default function parse(list: string[], errorMessage: string): any {
  const dictionary = {}
  for (let i = 0; i < list.length; i += 1) {
    const split = list[i].split(/=(.+)/)
    if (split.length !== 3) {
      throw {
        message: errorMessage,
      }
    }
    const [k, v] = split
    dictionary[k] = v
  }
  return dictionary
}

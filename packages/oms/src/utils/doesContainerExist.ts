/**
 * Checks if a docker container exists with the given name.
 *
 * @param {String} name The given name
 * @param {Array<Object>} containers The given containers
 * @return {Boolean} True if it exists, otherwise, false
 */
export default function doesContainerExist(name: string, containers: any[]): boolean {
  for (let i = 0; i < containers.length; i += 1) {
    for (let j = 0; j < containers[i].RepoTags.length; j += 1) {
      if (containers[i].RepoTags[j].includes(name)) {
        return true
      }
    }
  }
  return false
}

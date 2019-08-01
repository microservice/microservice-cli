import exec from './exec'

/**
 * Creates a name for the Docker images based of the git remote -v.
 *
 * @param {boolean} ui Defines if UI mode is enabled or not
 * @return {Promise<String>} The image name
 */
export default async function createImageName(ui: boolean = false): Promise<string | any> {
  try {
    const data = await exec('git remote -v')
    if (data.match(/git@github\.com:(\w+\/[\w|.|-]+).git/)) {
      return ui
        ? `${data.match(/git@github\.com:(\w+\/[\w|.|-]+).git/)[1].toLowerCase()}`
        : `omg/${data.match(/git@github\.com:(\w+\/[\w|.|-]+).git/)[1].toLowerCase()}`
    }
    return ui
      ? `${data.match(/https:\/\/github\.com\/(\w+\/[\w|.|-]+)/)[1].toLowerCase()}`
      : `omg/${data.match(/https:\/\/github\.com\/(\w+\/[\w|.|-]+)/)[1].toLowerCase()}`
  } catch (e) {
    if (ui) {
      return {
        owner: `${Buffer.from(process.cwd())
          .toString('base64')
          .toLowerCase()
          .replace(/=/g, '')}`,
        generated: true,
      }
    }
    return `omg/${Buffer.from(process.cwd())
      .toString('base64')
      .toLowerCase()
      .replace(/=/g, '')}`
  }
}

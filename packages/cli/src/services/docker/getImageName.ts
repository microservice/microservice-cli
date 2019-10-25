import path from 'path'
import execa from 'execa'
import gitUrlParse from 'git-url-parse'

interface GetImageNameOptions {
  configPath: string
}
interface GetImageNameResult {
  name: string
  generated: boolean
}

const REMOTE_REGEXP = /(?:\S+)\s+(\S+)\s+(?:\S+)/
export default async function getImageName(options: GetImageNameOptions): Promise<GetImageNameResult> {
  try {
    const { stdout } = await execa('git', ['remote', '-v'], {
      cwd: path.dirname(options.configPath),
    })
    const firstRemote = REMOTE_REGEXP.exec(stdout)
    if (firstRemote) {
      const parsed = gitUrlParse(firstRemote[1])
      if (parsed.full_name) {
        return { name: `oms/${parsed.full_name}`.toLowerCase(), generated: false }
      }
    }
  } catch (_) {
    /* No op */
  }

  const directoryHash = Buffer.from(process.cwd())
    .toString('base64')
    .toLowerCase()
    .replace(/=/g, '')
  return {
    name: `oms/${directoryHash}`.toLowerCase(),
    generated: true,
  }
}

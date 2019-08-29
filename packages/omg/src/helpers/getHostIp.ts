import execa from 'execa'

export default async function getHostIp(): Promise<string | null> {
  const hostDomain = 'host.docker.internal'
  const { exitCode, stdout } = await execa('ip', ['-4', 'addr', 'show', 'docker0'])
  if (exitCode === 0) {
    const outputMatch = stdout.match(/inet ([\d.]+)/)
    if (outputMatch) {
      return `${hostDomain}:${outputMatch[1]}`
    }
  }
  return null
}

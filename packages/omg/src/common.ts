import { CompositeDisposable } from 'event-kit'
import execa from 'execa'

export const DEBUG_CLI = {}.hasOwnProperty.call(process.env, 'OMG_CLI_DEBUG') || process.argv.includes('--debug')
export const lifecycleDisposables = new CompositeDisposable()

export async function getHostIp(): Promise<string | null> {
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

import dockerode from 'dockerode'
import { PassThrough } from 'stream'
import { createInterface } from 'readline'
import { Emitter, Disposable } from 'event-kit'

export default class DaemonLogs {
  emitter: Emitter
  container: dockerode.Container

  constructor(container: dockerode.Container) {
    this.emitter = new Emitter()
    this.container = container
  }

  async start() {
    const stdoutStream = new PassThrough()
    const stderrStream = new PassThrough()

    const stdoutLineInterface = createInterface({
      input: stdoutStream,
    })
    const stderrLineInterface = createInterface({
      input: stderrStream,
    })

    stdoutLineInterface.on('line', line => {
      this.emitter.emit('log-line', line)
    })
    stderrLineInterface.on('line', line => {
      this.emitter.emit('error-line', line)
    })

    const containerStream = await this.container.attach({ stream: true, stdout: true, stderr: true })
    this.container.modem.demuxStream(containerStream, stdoutStream, stderrStream)
  }

  onLogLine(callback: (line: string) => void): Disposable {
    return this.emitter.on('log-line', callback)
  }

  onErrorLine(callback: (line: string) => void): Disposable {
    return this.emitter.on('error-line', callback)
  }

  onDidDestroy(callback: () => void): Disposable {
    return this.emitter.on('did-destroy', callback)
  }

  dispose() {
    this.emitter.emit('did-destroy')
    this.emitter.dispose()
  }
}

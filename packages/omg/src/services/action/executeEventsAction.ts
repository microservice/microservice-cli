import { Disposable } from 'event-kit'
import { Daemon } from '~/services/daemon'
import { Args, ConfigSchemaAction } from '~/types'

interface ExecuteEventsActionOptions {
  daemon: Daemon
  args: Args
  action: ConfigSchemaAction
  actionName: string
  eventName: string
  callback: (payload: any) => void
}

export default async function executeEventsAction(options: ExecuteEventsActionOptions): Promise<{ disposable: Disposable }> {
  const disposable = new Disposable(() => {})

  return { disposable }
}

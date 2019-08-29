import { Args } from '~/types'

export default function argsToMap(args: Args): Record<string, any> {
  const obj = {}
  args.forEach(([k, v]) => {
    obj[k] = v
  })
  return obj
}

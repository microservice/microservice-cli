import { Args } from '~/types'

// From [[key, val], [key, val]]
// To {key: val}
export default function argsToMap(args: Args): Record<string, any> {
  const obj = {}
  args.forEach(([k, v]) => {
    obj[k] = v
  })
  return obj
}

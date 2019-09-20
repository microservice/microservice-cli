import { Args } from '~/types'

// From {key: val}
// To [[key, val], [key, val]]
export default function argsToMap(map: Record<string, any>): Args {
  const args: Args = []
  Object.keys(map).forEach(key => {
    args.push([key, map[key]])
  })

  return args
}

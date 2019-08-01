import { exec as execCmd } from 'child_process'
import LineUp from 'lineup'

import manifest from '../../package.json'

const lineup = new LineUp()

/**
 * Checks if the current version is up to date with the published one
 */
export default function checkVersion() {
  execCmd(
    'npm view omg version',
    {
      encoding: 'utf8',
    },
    (e, out, err) => {
      if (out) {
        const versions = {
          local: manifest.version.trim().match(/^(\d+).(\d+).(\d+)/),
          distant: out
            .toString()
            .trim()
            .match(/^(\d+).(\d+).(\d+)/),
        }
        for (let i = 1; i <= 3; i += 1) {
          if (versions.distant[i] > versions.local[i]) {
            let updateLabel = 'Patch'
            if (i === 1) {
              updateLabel = 'Major'
            } else if (i === 2) {
              updateLabel = 'Minor'
            }

            lineup.sticker.note('')
            lineup.sticker.note(
              `${lineup.colors.yellow(`${updateLabel} update available: `)}${lineup.colors.red(
                versions.local[0],
              )} ${lineup.colors.yellow('=>')} ${lineup.colors.green(versions.distant[0])}`,
            )
            lineup.sticker.note(`${lineup.colors.yellow(`Run: 'npm i -g omg' or 'yarn global add omg' to update`)}`)
            lineup.sticker.note('')
            versionAvailable = true
          }
        }
      }
    },
  )
}

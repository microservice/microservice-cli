import LineUp from 'lineup'

const lineup = new LineUp()

/**
 * If the CLI is outdated, posts a warning in the terminal
 */
export default function showVersionCard() {
  lineup.sticker.show({
    align: 'center',
    color: 'red',
  })
}

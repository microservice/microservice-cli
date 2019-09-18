<template>
  <div :style="componentStyle">
    <slot />
  </div>
</template>

<script lang="ts">
import * as colors from '~/theme/colors'
import * as textSizes from '~/theme/textSizes'

type PropsText = {
  color?: keyof typeof colors
  size?: keyof typeof textSizes
}

function propsToStyles(props: Partial<PropsText>) {
  const styles: Record<string, any> = {}

  if (props.color) {
    styles.color = colors[props.color]
  }
  if (props.size) {
    const { lineHeight, fontSize } = textSizes[props.size]
    styles.fontSize = `${fontSize}px`
    styles.lineHeight = `${lineHeight}px`
  }

  return styles
}

export default {
  props: ['color', 'size'],
  data(cc) {
    return { componentStyle: propsToStyles(cc._props) }
  },
}
</script>

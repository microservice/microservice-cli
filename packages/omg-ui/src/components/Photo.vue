<template>
  <img :src="source" :style="componentStyle" />
</template>

<script lang="ts">
type PropsPhoto = {
  size?: number
}

function propsToStyles(props: Partial<PropsPhoto>) {
  const styles: Record<string, any> = {}

  if (props.size) {
    styles.width = props.size * 8
  }

  return styles
}

export default {
  props: {
    size: {
      type: Number,
    },
    source: {
      type: String,
    },
  },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props) }
  },
}
</script>

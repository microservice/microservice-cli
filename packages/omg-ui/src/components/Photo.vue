<template>
  <Flex column justifyContent="center" v-bind="componentStyle">
    <img :src="source" :style="imageStyle" />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

type PropsPhoto = {
  size?: number
}

function propsToStyles(props: Partial<PropsPhoto>) {
  const styles: Record<string, any> = {}

  if (props.size) {
    styles.width = props.size * 8
  }

  return { ...styles }
}

export default {
  inheritAttrs: false,

  props: {
    size: {
      type: Number,
    },
    source: {
      type: String,
    },
  },
  components: { Flex },
  data(cc) {
    return { imageStyle: propsToStyles(cc._props), componentStyle: cc.$attrs }
  },
}
</script>

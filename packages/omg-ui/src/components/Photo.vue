<template>
  <Flex
    v-bind="componentStyle"
    v-on:click="onPress"
    column
    justify-content="center"
  >
    <img
      :src="source"
      :style="imageStyle"
    >
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

interface PropsPhoto {
  size?: number
  width?: number
  height?: number
  onPress?: () => void
}

function defaultOnPress() {
  /* No op */
}

function propsToStyles(props: Partial<PropsPhoto>) {
  const styles: Record<string, any> = {}

  if (props.size) {
    styles.width = props.size * 8
    styles.height = props.size * 8
  }
  if (props.width) {
    styles.width = props.width * 8
  }
  if (props.height) {
    styles.height = props.height * 8
  }
  if (props.onPress && props.onPress !== defaultOnPress) {
    styles.cursor = 'pointer'
  }

  return { ...styles }
}

export default {
  components: { Flex },
  inheritAttrs: false,

  props: {
    size: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    source: {
      type: String,
    },
    onPress: {
      type: Function,
      default: defaultOnPress,
    },
  },
  data(cc) {
    return { imageStyle: propsToStyles(cc._props), componentStyle: cc.$attrs }
  },
}
</script>

<template>
  <Flex column justifyContent="center" v-bind="componentStyle" v-on:click="onPress">
    <img :src="source" :style="imageStyle" />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

type PropsPhoto = {
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
  components: { Flex },
  data(cc) {
    return { imageStyle: propsToStyles(cc._props), componentStyle: cc.$attrs }
  },
}
</script>

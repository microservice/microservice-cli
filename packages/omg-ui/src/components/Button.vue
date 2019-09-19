<template>
  <Flex
    cursor="pointer"
    alignItems="center"
    v-bind="componentStyle"
    v-on:click="onPress"
    class="omg-button"
  >
    <slot />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

type PropsButton = {
  bold?: boolean
  onPress?: () => void
}

function propsToStyles(props: Partial<PropsButton>, extraProps: Record<string, any>) {
  const styles: Record<string, any> = {}

  if (props.bold) {
    styles.fontWeight = '500'
  }

  return { ...styles, ...extraProps }
}

export default {
  inheritAttrs: false,

  props: {
    bold: {
      type: Boolean,
    },
    onPress: {
      type: Function,
      default() {},
    },
  },

  components: { Flex },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props, cc.$attrs) }
  },
}
</script>
<style lang="less">
.omg-button {
  user-select: none;
  opacity: 0.8;
  &:active {
    opacity: 1;
  }
}
</style>

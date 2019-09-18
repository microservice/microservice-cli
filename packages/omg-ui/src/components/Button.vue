<template>
  <Flex cursor="pointer" v-bind="componentStyle">
    <slot />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

type PropsButton = {
  bold?: boolean
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
  },

  components: { Flex },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props, cc.$attrs) }
  },
}
</script>

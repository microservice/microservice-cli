<template>
  <Flex
    v-bind="componentStyle"
    v-bind:style="{cursor: disabled ? 'initial' : 'pointer', filter: disabled ? 'contrast(0.7)' : 'none'}"
    v-on:click="handlePress"
    v-bind:class="{'disabled': disabled}"
    class="app-button"
    align-items="center"
  >
    <slot />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

interface PropsButton {
  bold?: boolean
  disabled?: boolean
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
  components: { Flex },
  inheritAttrs: false,

  props: {
    bold: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
    onPress: {
      type: Function,
      default() {},
    },
  },
  data(cc) {
    return { componentStyle: propsToStyles(cc._props, cc.$attrs) }
  },

  methods: {
    handlePress(e) {
      if (this.disabled) {
        return
      }
      if (this.onPress) {
        this.onPress(e)
      }
    },
  },
}
</script>
<style lang="less" scoped>
.app-button {
  user-select: none;
  opacity: 0.8;
  &&:not(.disabled):active {
    opacity: 1;
  }
}
</style>

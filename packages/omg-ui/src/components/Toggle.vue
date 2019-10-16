<template>
  <Flex
    row
    :b="1"
    v-bind="componentStyle"
    v-on:click="onToggle"
    :class="{'oms-toggle': true, enabled}"
    bordercolor="blue40"
  >
    <Flex class="spacer-1" />
    <Flex :flex="1" borderRadius="2px" margin="2px" class="bullet" />
    <Flex class="spacer-2" />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

type PropsPhoto = {
  enabled: boolean
  onToggle: () => void
}

export default {
  inheritAttrs: false,

  props: {
    enabled: {
      type: Boolean,
      required: true,
    },
    onToggle: {
      type: Function,
      required: true,
    },
  },
  components: { Flex },
  data(cc) {
    return { componentStyle: cc.$attrs }
  },
}
</script>
<style lang="less" scoped>
  .oms-toggle {
    width: 24px;
    cursor: pointer;
    border-radius: 2px;
    background-color: white;

    .bullet {
      background-color: #477BF3;
    }
    .spacer-1 {
      flex: 0;
    }
    .spacer-2 {
      flex: 2;
    }
    &.enabled {
      background-color: #477BF3;

      .spacer-1 {
        flex: 2
      }
      .spacer-2 {
        flex: 0;
      }
      .bullet {
        background-color: white;
      }
    }
  }
</style>

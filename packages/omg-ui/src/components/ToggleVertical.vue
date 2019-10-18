<template>
  <Flex
    v-on:click="onToggle"
    :class="{'oms-toggle': true, enabled}"
    row
    justify-content="center"
    align-items="center"
  >
    <Dropdown :color="dropdownColor" :size="1" />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'
import Dropdown from '~/icons/Dropdown'

export default {
  components: { Flex, Dropdown },
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
  computed: {
    dropdownColor() {
      return this.enabled ? 'grey60' : 'blue40'
    },
  },
}
</script>
<style lang="less" scoped>
.oms-toggle {
  user-select: none;
  width: 30px;
  cursor: pointer;
  border-radius: 2px;
  background-color: white;
  box-shadow: 0px 1px 5px rgba(24, 59, 140, 0.186325);

  svg {
    transform: rotate(180deg);
  }
  &.enabled {
    background-color: #cbd2d9;
    svg {
      transform: none;
    }
  }
}
</style>

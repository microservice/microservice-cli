<template>
  <Flex
    row
    justifyContent="center"
    alignItems="center"
    v-on:click="onToggle"
    :class="{'oms-toggle': true, enabled}"
  >
    <Dropdown :color="dropdownColor" :size="1" />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'
import Photo from './Photo.vue'
import Dropdown from '~/icons/Dropdown'

export default {
  inheritAttrs: false,
  computed: {
    dropdownColor() {
      return this.enabled ? 'grey60' : 'blue40'
    },
  },
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
  components: { Flex, Photo, Dropdown },
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

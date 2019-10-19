<template>
  <Flex
    v-on:click="onToggle"
    :class="{'oms-toggle': true, enabled}"
    row
    justify-content="center"
    align-items="center"
  >
    <Dropdown key="dropdown-enabled" class="dropdown-enabled" v-if="enabled" />
    <Dropdown key="dropdown-disabled" class="dropdown-disabled" v-if="!enabled" />
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

  .dropdown-disabled {
    transform: rotate(180deg);
    fill: #477bf3;
  }
  .dropdown-enabled {
    fill: #616e7c;
  }
  &.enabled {
    background-color: #cbd2d9;
  }
}
</style>

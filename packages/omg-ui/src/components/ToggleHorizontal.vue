<template>
  <Flex
    :b="1"
    v-on:click="onToggle"
    :class="{'oms-toggle': true, enabled}"
    row
    bordercolor="blue40"
  >
    <Flex class="spacer-1" />
    <Flex
      :flex="1"
      border-radius="2px"
      margin="2px"
      class="bullet"
    />
    <Flex class="spacer-2" />
  </Flex>
</template>

<script lang="ts">
import Flex from './Flex.vue'

export default {
  components: { Flex },
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
  width: 24px;
  cursor: pointer;
  border-radius: 2px;
  background-color: white;
  box-shadow: 0px 1px 5px rgba(24, 59, 140, 0.186325);

  .bullet {
    background-color: #477bf3;
  }
  .spacer-1 {
    flex: 0;
  }
  .spacer-2 {
    flex: 2;
  }
  &.enabled {
    background-color: #477bf3;

    .spacer-1 {
      flex: 2;
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

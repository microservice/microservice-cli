
<template>
  <svg viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" :style="svgStyle">
    <path d="M4 4.66675L0 0.666748H8L4 4.66675Z" :fill="fillColor" />
  </svg>
</template>

<script lang="ts">
import * as colors from '~/theme/colors'

export default {
  props: {
    color: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  computed: {
    fillColor() {
      return colors[this.color] || this.color
    },
    svgStyle() {
      return {
        width: `${this.size * 8}px`,
      }
    },
  },
}
</script>

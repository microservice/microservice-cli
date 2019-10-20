<template>
  <div class="overlay">
    <slot />
  </div>
</template>
<script lang="ts">
export default {}
</script>
<style scoped lang="less">
.overlay {
  display: flex;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(154, 165, 177, 0.2);
}
</style>

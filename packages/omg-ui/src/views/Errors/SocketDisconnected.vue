<template>
  <div class="socket-disconnected-container">
    <div>OMG App has been shutdown from terminal (end up or error).</div>
  </div>
</template>

<script>
export default {
  name: 'socket-disconnected'
}
</script>

<style lang="scss" scoped>
.socket-disconnected-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

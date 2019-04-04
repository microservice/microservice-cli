<template>
  <div class="layout-container">
    <top-bar />
    <div class="left-bar">
      <owner />
      <navigation />
      <docker-commands />
      <!-- <grade /> -->
      <!-- <perf-graph /> -->
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/Layout/Navigation'
import TopBar from '@/components/Layout/TopBar'
import Owner from '@/components/Layout/Owner'
import DockerCommands from '@/components/Layout/DockerCommands'

export default {
  name: 'layout',
  components: {
    Navigation,
    TopBar,
    Owner,
    DockerCommands
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  padding-left: 49px;
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  width: 300px;
  min-width: 300px;
  border-right: 1px solid lightslategray;

  .left-bar {
    display: flex;
    flex-flow: column nowrap;
    height: calc(100vh - 88px);
    width: 100%;
  }
}
</style>

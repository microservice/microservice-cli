<template>
  <div class="topbar-container">
    <div class="topbar-left">
      <img
        src="https://avatars2.githubusercontent.com/u/39149433?s=200&v=4"
        alt="OMG app logo"
        class="logo"
      >
    </div>
    <div class="topbar-right">
      <div class="title-container">
        <h1 class="title">{{ $route.name }}</h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'topbar'
}
</script>

<style lang="scss" scoped>
.topbar-container {
  width: 100vw;
  display: flex;
  height: 88px;

  .topbar-left {
    width: 300px;
    min-width: 300px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    img {
      width: 20%;
      border-radius: 10px;
      margin-left: 10px;
    }
  }

  .topbar-right {
    width: 100%;
    border-bottom: 1px solid lightslategray;
    height: inherit;
  }
}
</style>

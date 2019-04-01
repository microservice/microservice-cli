<template>
    <section class="menu-container">
    <div class="menu-wrapper">
      <ul class="menu-list">
        <router-link :to="{name: 'actions'}" tag="li" class="menu-item">Actions</router-link>
        <li class="menu-item">History</li>
        <router-link :to="{name: 'environment'}" tag="li" class="menu-item">Environment</router-link>
        <li class="menu-item">Documentation</li>
        <li class="menu-item">Inspection</li>
        <li class="menu-item">Usage</li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: 'navagation'
}
</script>

<style lang="scss" scoped>
.menu-container {
  flex: 6;
  border-bottom: 1px solid lightslategray;

  ul.menu-list {
    padding: 20px;
    margin: 0;
    text-align: left;
    list-style: none;

    li.menu-item {
      margin-bottom: 20px;
      font-size: 1.8rem;
      cursor: pointer;
    }
  }
}
</style>

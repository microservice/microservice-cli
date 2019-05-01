<template>
  <section class="menu-container">
    <div class="menu-wrapper">
      <ul class="menu-list">
        <li class="menu-item actions">
          <div class="title">Actions</div>
          <action-nav />
        </li>
        <router-link :to="{ name: 'expose' }" tag="li" class="menu-item">
          <div class="title">Expose/Forward</div>
          <arrow-forward />
        </router-link>
        <router-link :to="{ name: 'environments' }" tag="li" class="menu-item">
          <div class="title">Environment Variables</div>
          <arrow-forward />
        </router-link>
      </ul>
    </div>
  </section>
</template>

<script>
import ArrowForward from '@/components/ArrowForward'
import ActionNav from '@/components/layout/navigation/ActionNav'

export default {
  name: 'navigation',
  components: { ArrowForward, ActionNav }
}
</script>

<style lang="scss" scoped>
.menu-container {
  ul.menu-list {
    padding: 0;
    text-align: left;
    list-style: none;
    margin-left: 24px;
    margin-top: 24px;

    li.menu-item {
      display: flex;
      justify-content: space-between;
      margin-left: 8px;
      margin-top: 24px;
      width: 228px;
      cursor: pointer;

      &.actions {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .title {
          margin-left: 8px;
          margin-bottom: 12px;
        }
      }

      .title {
        height: 21px;
        color: #1f2933;
        font-family: Graphik;
        font-size: 16px;
        font-weight: 500;
        line-height: 21px;
      }
    }
  }
}
</style>

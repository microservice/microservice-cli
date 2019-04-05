<template>
  <section class="menu-container">
    <div class="menu-wrapper">
      <ul class="menu-list">
        <router-link :to="{ name: 'actions' }" tag="li" class="menu-item">
          <div class="left">
            <div class="menu-item-icon"></div>
            <span class="menu-item-title">Actions</span>
          </div>
          <arrow-forward />
        </router-link>
        <router-link :to="{ name: 'history' }" tag="li" class="menu-item">
          <div class="left">
            <div class="menu-item-icon"></div>
            <span class="menu-item-title">History</span>
          </div>
          <arrow-forward />
        </router-link>
        <router-link :to="{ name: 'environment' }" tag="li" class="menu-item">
          <div class="left">
            <div class="menu-item-icon"></div>
            <span class="menu-item-title">Environment</span>
          </div>
          <arrow-forward />
        </router-link>
        <li class="menu-item">
          <div class="left">
            <div class="menu-item-icon"></div>
            <span class="menu-item-title">Documentation</span>
          </div>
          <arrow-forward />
        </li>
        <li class="menu-item">
          <div class="left">
            <div class="menu-item-icon"></div>
            <span class="menu-item-title">Inspection</span>
          </div>
          <arrow-forward />
        </li>
        <li class="menu-item">
          <div class="left">
            <div class="menu-item-icon"></div>
            <span class="menu-item-title">Usage</span>
          </div>
          <arrow-forward />
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import ArrowForward from '@/components/ArrowForward.vue'

export default {
  name: 'navigation',
  components: { ArrowForward }
}
</script>

<style lang="scss" scoped>
.menu-container {
  flex: 6;
  border-bottom: 1px solid lightslategray;

  ul.menu-list {
    padding: 0;
    margin: 0;
    text-align: left;
    list-style: none;

    li.menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding: 4px 17px 4px 4px;

      .left {
        display: flex;
        align-items: center;

        .menu-item-icon {
          height: 32px;
          width: 32px;
          border-radius: 5px;
          background-color: #ffffff;
          box-shadow: 0 3px 7px 0 rgba(11, 25, 69, 0.1);
          margin-right: 12px;
        }

        .menu-item-title {
          height: 21px;
          color: #8385a4;
          font-family: GilroySemiBold;
          font-size: 14px;
          letter-spacing: 1px;
          line-height: 21px;
          cursor: pointer;
          text-transform: uppercase;
        }
      }

      &.router-link-active {
        border-radius: 5px;
        background-color: #f5f6f9;
      }
    }

    li.menu-item:not(:last-child) {
      margin-bottom: 1px;
    }
  }
}
</style>

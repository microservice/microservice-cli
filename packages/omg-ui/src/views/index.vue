<template>
  <div v-if="appReady" class="app-root">
    <div class="app-wrapper">
      <AppHeader />
      <div class="app-content">
        <ActionsHistory v-if="showHistory" />
        <div class="app-content-right">
          <AppCenter />
          <AppFooter />
        </div>
      </div>
    </div>
    <Modals />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import AppHeader from './AppHeader/index.vue'
import AppCenter from './AppCenter/index.vue'
import AppFooter from './AppFooter.vue'
import ActionsHistory from './ActionsHistory.vue'

import Modals from './Modals/index.vue'

export default {
  components: { AppHeader, AppCenter, ActionsHistory, AppFooter, Modals },
  computed: {
    ...mapGetters({
      appReady: 'getAppReady',
      activeModal: 'getActiveModal',
      showHistory: 'getShowHistory',
    }),
  },
}
</script>

<style lang="scss" scoped>
@use "~/styles/mixins" as *;

.app-root {
  display: flex;
  height: 100%;
  overflow: hidden;
  @include text-medium;
}
.app-wrapper {
  @include flex($column: true, $flex: 1);
}
.app-content {
  min-height: 0;
  @include flex($row: true, $flex: 1);
}
.app-content-right {
  overflow: hidden;
  @include flex($column: true, $flex: 1);
}
</style>

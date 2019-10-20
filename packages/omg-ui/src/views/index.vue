<template>
  <div v-if="appReady" class="app-root">
    <div v-bind:class="{'app-content': true, 'hidden': !!activeModal}">
      <AppHeader />
      <Flex :flex="1" row height="100%">
        <ActionsHistory v-if="showHistory" />
        <Flex :flex="1" column overflow="hidden">
          <AppCenter />
          <AppFooter />
        </Flex>
      </Flex>
    </div>
    <Modals />
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'

import AppHeader from './AppHeader/index.vue'
import AppCenter from './AppCenter/index.vue'
import AppFooter from './AppFooter.vue'
import ActionsHistory from './ActionsHistory.vue'

import Modals from './Modals/index.vue'

export default {
  components: { Flex, AppHeader, AppCenter, ActionsHistory, AppFooter, Modals },
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
  height: 100%;
  overflow: hidden;
  @include text-medium;
}
.app-content {
  @include flex($column: true, $flex: 1);
}
.content-hidden {
  filter: blur(2px);
}
</style>

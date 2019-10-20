<template>
  <div v-if="appReady" class="app-root">
    <Flex v-bind:class="{'content-hidden': !!activeModal}" column flex="1">
      <AppHeader />
      <Flex :flex="1" row height="100%">
        <ActionsHistory v-if="showHistory" />
        <Flex :flex="1" column overflow="hidden">
          <AppCenter />
          <AppFooter />
        </Flex>
      </Flex>
    </Flex>
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
  @include text-medium;
}
.content-hidden {
  filter: blur(2px);
}
</style>

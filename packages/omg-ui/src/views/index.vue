<template>
  <div v-if="appReady">
    <Words size="medium">
      <Flex
        v-bind:class="{'content-hidden': !!activeModal}"
        column
        flex="1"
      >
        <AppHeader />
        <Flex
          :flex="1"
          row
          height="100%"
        >
          <ActionsHistory v-if="showHistory" />
          <Flex
            :flex="1"
            column
            overflow="hidden"
          >
            <AppCenter />
            <AppFooter />
          </Flex>
        </Flex>
      </Flex>
      <Modals />
    </Words>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'

import AppHeader from './AppHeader/index.vue'
import AppCenter from './AppCenter/index.vue'
import AppFooter from './AppFooter.vue'
import ActionsHistory from './ActionsHistory.vue'

import Modals from './Modals/index.vue'

export default {
  components: { Flex, Words, AppHeader, AppCenter, ActionsHistory, AppFooter, Modals },
  computed: {
    ...mapGetters({
      appReady: 'getAppReady',
      activeModal: 'getActiveModal',
      showHistory: 'getShowHistory',
    }),
  },
}
</script>

<style lang="less" scoped>
.content-hidden {
  filter: blur(2px);
}
</style>

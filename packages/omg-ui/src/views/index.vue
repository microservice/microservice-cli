<template>
  <div id="omg" v-if="appReady">
    <Words size="medium">
      <Flex column flex="1" v-bind:class="{'omg-content-hidden': !!activeModal}">
        <OMGHeader />
        <Flex row :flex="1" height="100%">
          <OMGLeft v-if="showHistory" />
          <Flex column :flex="1" overflow="hidden">
            <OMGCenter />
            <OMGFooter />
          </Flex>
        </Flex>
      </Flex>
      <Modals />
    </Words>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'

import OMGHeader from './OMGHeader.vue'
import OMGCenter from './OMGCenter.vue'
import OMGLeft from './OMGLeft.vue'
import OMGFooter from './OMGFooter.vue'

import Modals from './Modals/index.vue'

export default {
  components: { Flex, Words, OMGHeader, OMGCenter, OMGLeft, OMGFooter, Modals },
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
.omg-content-hidden {
  filter: blur(2px);
}
</style>

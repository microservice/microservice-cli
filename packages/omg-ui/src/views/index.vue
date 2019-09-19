<template>
  <div id="omg">
    <Words size="medium">
      <Flex column flex="1" height="100%" v-bind:class="{'omg-content-hidden': !!activeModal}">
        <OMGHeader />
        <Flex row :flex="1" overflow="hidden">
          <OMGLeft />
          <OMGCenter />
          <OMGRight />
        </Flex>
        <OMGFooter />
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
import OMGRight from './OMGRight.vue'
import OMGLeft from './OMGLeft.vue'
import OMGFooter from './OMGFooter.vue'

import Modals from './Modals/index.vue'

export default {
  components: { Flex, Words, OMGHeader, OMGCenter, OMGRight, OMGLeft, OMGFooter, Modals },
  computed: {
    ...mapGetters({
      activeModal: 'getActiveModal',
    }),
  },
}
</script>

<style lang="less">
.omg-content-hidden {
  filter: blur(2px);
}
</style>

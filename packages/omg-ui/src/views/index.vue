<template>
  <div id="omg">
    <Words size="medium">
      <Flex column flex="1" height="100%" v-bind:class="{'omg-content-hidden': !!getActiveModal}">
        <OMGHeader />
        <Flex row :flex="1" height="100%">
          <Flex column :flex="1" height="100%">
            <OMGCenter />
            <OMGFooter />
          </Flex>
          <OMGRight />
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
import OMGRight from './OMGRight.vue'
import OMGFooter from './OMGFooter.vue'

import Modals from './Modals/index.vue'

export default {
  components: { Flex, Words, OMGHeader, OMGCenter, OMGRight, OMGFooter, Modals },
  computed: {
    ...mapGetters(['getActiveModal']),
  },
}
</script>

<style lang="less">
.omg-content-hidden {
  filter: blur(2px);
}
</style>

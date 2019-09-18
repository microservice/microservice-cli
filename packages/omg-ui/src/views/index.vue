<template>
  <div id="omg">
    <Words size="medium">
      <Flex column flex="1" height="100%">
        <OMGHeader />
        <Flex row :flex="1" height="100%">
          <Flex column :flex="1" height="100%">
            <OMGCenter />
            <OMGFooter />
          </Flex>
          <OMGRight />
        </Flex>
      </Flex>
    </Words>
  </div>
</template>

<script>
import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'

import OMGHeader from './OMGHeader.vue'
import OMGCenter from './OMGCenter.vue'
import OMGRight from './OMGRight.vue'
import OMGFooter from './OMGFooter.vue'

export default {
  components: { Flex, Words, OMGHeader, OMGCenter, OMGRight, OMGFooter },
}
</script>

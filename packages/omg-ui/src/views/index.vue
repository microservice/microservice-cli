<template>
  <div id="omg">
    <Words size="medium">
      <OMGHeader />
      <OMGCenter />
    </Words>
  </div>
</template>

<script>
import OMGHeader from './OMGHeader.vue'
import OMGCenter from './OMGCenter.vue'
import OMGFooter from './OMGFooter.vue'
import Words from '~/components/Words.vue'

export default {
  components: { OMGHeader, OMGCenter, OMGFooter, Words },
}
</script>

<template>
  <div id="omg">
    <Words size="medium">
      <OMGHeader />
    </Words>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import OMGHeader from './OMGHeader.vue'
import OMGFooter from './OMGFooter.vue'
import Words from '~/components/Words.vue'

export default {
  components: { OMGHeader, OMGFooter, Words },
  computed: mapGetters([]),
  methods: {},
}
</script>

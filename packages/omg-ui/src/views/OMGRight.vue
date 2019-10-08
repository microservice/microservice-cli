<template>
  <Flex column backgroundColor="grey10" width="22%">
    <Flex column :flex="1" :bl="1" overflow="hidden">
      <Flex row :bv="1" :ph="1" :pv="1.125">
        <Button :ph="3" :pv="1" bold color="grey70" :onPress="openEnvironmentModal">
          <Photo :source="iconFileCodeSource" :size="3" :mr="1" />Setup
        </Button>
        <Button :ph="3" :pv="1" bold color="grey70" :onPress="openYamlEditorModal">
          <Photo :source="iconBookmarkSource" :size="3" :mr="1" />Edit the YAML
        </Button>
      </Flex>
      <Flex column backgroundColor="white" :flex="1" :ph="2" :pt="3" :pb="1" overflow="hidden">
        <Words fontWeight="500" size="large">Container Logs (stdout &amp; stderr)</Words>
        <Words color="grey60" marginTop="12px" overflowY="scroll">
          <pre class="omg-right-logs" v-text="logsAllReverse"></pre>
        </Words>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Button, Words, Photo },
  methods: {
    ...mapMutations(['openEnvironmentModal', 'openYamlEditorModal']),
  },
  computed: {
    ...mapGetters(['logsAllReverse']),
  },
  data: () => ({
    iconBookmarkSource: require('~/images/icon-bookmark.svg'),
    iconFileCodeSource: require('~/images/icon-file-code.svg'),
  }),
}
</script>
<style lang="less">
.omg-right-logs {
  font-family: Graphik;
  white-space: pre-wrap;
}
</style>

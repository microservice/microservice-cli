<template>
  <Flex column backgroundColor="grey10">
    <Flex column :flex="1" :bl="1">
      <Flex row :bv="1" :ph="2" :pv="1">
        <Button :ph="3" :pv="1" bold color="grey70">
          <Photo :source="iconFileCodeSource" size="3" :mr="1" />Setup
        </Button>
        <Button :ph="3" :pv="1" bold color="grey70">
          <Photo :source="iconBookmarkSource" size="3" :mr="1" />Edit the YAML
        </Button>
      </Flex>
      <Flex column backgroundColor="white" :flex="1">Container logs:</Flex>
    </Flex>
  </Flex>
</template>

<script>
import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Button, Photo },
  methods: {},
  data: () => ({
    iconBookmarkSource: require('~/images/icon-bookmark.svg'),
    iconFileCodeSource: require('~/images/icon-file-code.svg'),
  }),
}
</script>

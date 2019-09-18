<template>
  <Flex row :mv="1" :mh="2" :flex="1">
    <Flex row :flex="1">
      <Flex column>
        <Photo :source="omgLogoSource" :size="3" />
      </Flex>
      <Flex column :mh="1.5" justifyContent="center">
        <Words size="large">Open Microservice Guide</Words>
      </Flex>
    </Flex>
    <Flex row :flex="1" justifyContent="center">
      <Flex column size="medium" justifyContent="center">
        <Words>Unhealthy</Words>
      </Flex>
      <Flex column :ml="1.2" size="medium" justifyContent="center">
        <Words>Completeness</Words>
      </Flex>
    </Flex>
    <Flex row :flex="1" justifyContent="flex-end">
      <Flex row justifyContent="center" backgroundColor="blue40" color="white" :p="1">
        <Flex column :mr="1">Contribute on Github</Flex>
        <Photo :source="githubLogoSource" :size="2" />
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Words, Photo },
  data: () => ({
    omgLogoSource: require('~/images/omg-logo.png'),
    githubLogoSource: require('~/images/github-logo.png'),
  }),
}
</script>

<template>
  <Flex row :mv="1" :mh="2">
    <Flex row :flex="1">
      <Flex column>
        <Photo :source="appLogo" :size="3" />
      </Flex>
      <Flex column :mh="1.5" justifyContent="center">
        <Words size="large">Open Microservice Guide</Words>
      </Flex>
    </Flex>
    <Flex row :flex="1" justifyContent="center">
      <Flex column justifyContent="center">
        <Button
          theme="borderless"
          bold
          color="blue"
          backgroundColor="grey10"
          :p="1"
          v-text="appStatus"
        ></Button>
      </Flex>
      <Flex column :ml="1.5" justifyContent="center">
        <Button theme="borderless" bold color="blue" backgroundColor="grey10" :p="1">Completeness</Button>
      </Flex>
    </Flex>
    <Flex row :flex="1" justifyContent="flex-end">
      <Flex row justifyContent="center">
        <Button
          theme="borderless"
          bold
          backgroundColor="blue50"
          color="white"
          :p="1"
          :onPress="handleContributeOnGithub"
        >
          Contribute on Github
          <Photo :source="githubLogo" :size="2" :ml="1" />
        </Button>
      </Flex>
    </Flex>
  </Flex>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Photo from '~/components/Photo.vue'

import appLogo from '~/images/app-logo.svg'
import githubLogo from '~/images/github-logo.svg'

export default {
  components: { Flex, Button, Words, Photo },
  computed: {
    ...mapGetters(['appStatus']),
  },
  methods: {
    handleContributeOnGithub() {
      window.open('https://github.com/microservices/oms', '_blank', 'noopener,noreferrer')
    },
  },
  data: () => ({
    appLogo,
    githubLogo,
  }),
}
</script>

<template>
  <Flex :mv="1" :mh="2" row>
    <Flex :flex="1" row>
      <Flex column>
        <Photo :source="appLogo" :size="3" />
      </Flex>
      <Flex :mh="1.5" column justify-content="center">
        <Words size="large">Open Microservice Guide</Words>
      </Flex>
    </Flex>
    <Flex :flex="1" row justify-content="center">
      <Flex column justify-content="center">
        <Button
          :p="1"
          v-text="containerStatus"
          theme="borderless"
          bold
          color="blue"
          background-color="grey10"
        />
      </Flex>
      <!--<Flex :ml="1.5" column justify-content="center">
        <Button :p="1" theme="borderless" bold color="blue" background-color="grey10">Completeness</Button>
      </Flex>-->
    </Flex>
    <Flex :flex="1" row justify-content="flex-end">
      <Flex row justify-content="center">
        <Button
          :p="1"
          :onPress="handleContributeOnGithub"
          theme="borderless"
          bold
          background-color="blue50"
          color="white"
        >
          Contribute on Github
          <Photo :source="githubLogo" :size="2" :ml="1" />
        </Button>
      </Flex>
    </Flex>
  </Flex>
</template>

<script lang="ts">
import { startCase } from 'lodash'
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
    containerStatus() {
      return `Container state: ${startCase(this.appStatus)}`
    },
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

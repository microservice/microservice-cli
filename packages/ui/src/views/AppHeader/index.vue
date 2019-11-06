<template>
  <div class="header">
    <div class="branding">
      <div class="branding-logo">
        <Photo :source="appLogo" :size="3" />
      </div>
      <div class="branding-name">Open Microservices</div>
    </div>
    <div class="header-actions">
      <div class="header-action">
        <Button
          :p="1"
          v-text="containerStatus"
          theme="borderless"
          bold
          color="blue"
          background-color="grey10"
        />
      </div>
      <!--<Flex :ml="1.5" column justify-content="center">
        <Button :p="1" theme="borderless" bold color="blue" background-color="grey10">Completeness</Button>
      </Flex>-->
    </div>
    <div class="header-contribute">
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
    </div>
  </div>
</template>

<script lang="ts">
import { startCase } from 'lodash'
import { mapGetters } from 'vuex'

import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'

import appLogo from '~/images/app-logo.svg'
import githubLogo from '~/images/github-logo.svg'

export default {
  components: { Button, Photo },
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
<style lang="scss" scoped>
@use "~/styles/mixins" as *;
@use "~/styles/variables" as *;

.header {
  @include flex($row: true, $mv: 1, $mh: 2);
}
.branding {
  user-select: none;
  @include flex($row: true, $flex: 1);
}
.branding-logo {
  justify-content: center;
  @include flex($column: true);
}
.branding-name {
  justify-content: center;
  @include text-large;
  @include flex($column: true, $mh: 1.5);
}
.header-actions {
  justify-content: center;
  @include flex($row: true, $flex: 1);
}
.header-action {
  justify-content: center;
  @include flex($column: true);
}
.header-contribute {
  justify-content: flex-end;
  @include flex($row: true, $flex: 1);
}
</style>

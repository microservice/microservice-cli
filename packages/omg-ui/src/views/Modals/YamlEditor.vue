<template>
  <Flex row :flex="1">
    <Flex
      column
      :ph="2"
      :pt="2"
      :br="1"
      bordercolor="grey80"
      background="linear-gradient(180deg, #323F4B 0%, #1F2933 100%)"
      width="10%"
    >
      <Flex row :ph="1">
        <Button :onPress="dismissModal">
          <Photo :source="iconBackSource" :size="3" />
        </Button>
      </Flex>
      <Flex column :mt="8">
        <Flex
          row
          :ph="2"
          :pv="1"
          v-for="validationItem in configValidations"
          v-bind:key="validationItem[0]"
        >
          <Words color="white" size="large">{{validationItem[0]}}</Words>
          <Flex :flex="1" row justifyContent="flex-end" alignItems="center">
            <Photo :source="iconCircleCheck" :size="2" v-if="validationItem[1]" />
            <Photo :source="iconCircleTimes" :size="2" v-if="!validationItem[1]" />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
    <Flex :flex="1" column>
      <Flex
        row
        justifyContent="center"
        :pv="1"
        background="linear-gradient(180deg, #323F4B 0%, #1F2933 100%)"
      >
        <Words color="white">microservice.yaml</Words>
      </Flex>
      <Flex column :flex="1" background="white" :pv="1.5" :ph="1.5">
        <Monaco
          language="yaml"
          lineNumbers="on"
          :minimapEnabled="true"
          :code="configContents"
          :onChange="writeConfig"
        />
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import { debounce } from 'lodash'
import { mapMutations, mapGetters } from 'vuex'
import { writeConfig } from '~/rpc'

import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Monaco from '~/components/Monaco.vue'

export default {
  components: { Flex, Photo, Button, Words, Monaco },
  computed: {
    ...mapGetters({
      configValidationsRaw: 'getConfigValidation',
    }),
    configValidations() {
      return [
        ['Schema validation', this.configValidationsRaw.schema],
        ['Info', this.configValidationsRaw.info],
        ['Actions', this.configValidationsRaw.actions],
        ['Startup', this.configValidationsRaw.startup],
        ['Health', this.configValidationsRaw.health],
      ]
    },
  },
  methods: {
    ...mapMutations(['dismissModal']),
    writeConfig: debounce(
      function(contents) {
        const { configContents } = this
        if (configContents !== contents) {
          writeConfig(contents).then(() => {
            // Handle possible network race conditions
            if (this.configContents === configContents) {
              this.configContents = contents
            }
          })
        }
      },
      1000,
      { trailing: true },
    ),
  },
  created() {
    fetch('/api/configRaw')
      .then(response => response.text())
      .then(contents => {
        this.configContents = contents
      })
  },
  data: () => ({
    configContents: '',
    iconBackSource: require('~/images/icon-back.svg'),
    iconCircleCheck: require('~/images/icon-circle-check.svg'),
    iconCircleTimes: require('~/images/icon-circle-times.svg'),
  }),
}
</script>

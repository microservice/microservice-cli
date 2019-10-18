<template>
  <Flex
    :flex="1"
    row
  >
    <Flex
      :ph="2"
      :pt="2"
      :br="1"
      column
      bordercolor="grey80"
      background="linear-gradient(180deg, #323F4B 0%, #1F2933 100%)"
      width="10%"
    >
      <Flex
        :ph="1"
        row
      >
        <Button :onPress="dismissModal">
          <Photo
            :source="iconBackSource"
            :size="3"
          />
        </Button>
      </Flex>
      <Flex
        :mt="8"
        column
      >
        <Flex
          :ph="2"
          :pv="1"
          v-for="validationItem in configValidations"
          v-bind:key="validationItem[0]"
          row
        >
          <Words
            color="white"
            size="large"
          >
            {{ validationItem[0] }}
          </Words>
          <Flex
            :flex="1"
            row
            justify-content="flex-end"
            align-items="center"
          >
            <Photo
              :source="iconCircleCheck"
              :size="2"
              v-if="validationItem[1]"
            />
            <Photo
              :source="iconCircleTimes"
              :size="2"
              v-if="!validationItem[1]"
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
    <Flex
      :flex="1"
      column
    >
      <Flex
        :pv="1"
        row
        justify-content="center"
        background="linear-gradient(180deg, #323F4B 0%, #1F2933 100%)"
      >
        <Words color="white">
          microservice.yaml
        </Words>
      </Flex>
      <Flex
        :flex="1"
        :pv="1.5"
        :ph="1.5"
        column
        background="white"
      >
        <Monaco
          :minimapEnabled="true"
          :code="configContents"
          :onChange="writeConfig"
          language="yaml"
          line-numbers="on"
        />
      </Flex>
    </Flex>
  </Flex>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import { mapMutations, mapGetters } from 'vuex'
import { writeConfig } from '~/rpc'

import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Monaco from '~/components/Monaco.vue'

import iconBackSource from '~/images/icon-back.svg'
import iconCircleCheck from '~/images/icon-circle-check.svg'
import iconCircleTimes from '~/images/icon-circle-times.svg'

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
      function debouncedWriteConfig(contents) {
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
    iconBackSource,
    iconCircleCheck,
    iconCircleTimes,
  }),
}
</script>

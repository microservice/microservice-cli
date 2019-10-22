<template>
  <Flex :flex="1" row>
    <Flex
      :ph="2"
      :pt="2"
      :br="1"
      column
      bordercolor="grey80"
      background="linear-gradient(180deg, #323F4B 0%, #1F2933 100%)"
      width="10%"
    >
      <Flex :ph="1" row>
        <Button :onPress="dismissModal">
          <Photo :source="iconBackSource" :size="3" />
        </Button>
      </Flex>
      <Flex :mt="8" column>
        <Flex
          :ph="2"
          :pv="1"
          v-for="validationItem in configValidations"
          v-bind:key="validationItem[0]"
          row
        >
          <Words color="white" size="large">{{ validationItem[0] }}</Words>
          <Flex :flex="1" row justify-content="flex-end" align-items="center">
            <Photo :source="iconCircleCheck" :size="2" v-if="validationItem[1]" />
            <Photo :source="iconCircleTimes" :size="2" v-if="!validationItem[1]" />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
    <Flex :flex="1" column>
      <Flex
        :pv="1"
        row
        justify-content="center"
        background="linear-gradient(180deg, #323F4B 0%, #1F2933 100%)"
      >
        <Words color="white">oms.yaml</Words>
      </Flex>
      <Flex :flex="1" :pv="1.5" :ph="1.5" column background="white">
        <Monaco
          :minimapEnabled="true"
          :code="configContents"
          :onChange="handleEditorChanged"
          :onCreated="handleEditorCreated"
          language="yaml"
          line-numbers="on"
        />
      </Flex>
    </Flex>
  </Flex>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import { CompositeDisposable } from 'event-kit'
import { mapMutations, mapGetters } from 'vuex'
import { writeConfig, handleConfigUpdated } from '~/rpc'
import { getValidationMarkers } from '~/services/config'

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
      configValidationErrors: 'getConfigValidationErrors',
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
    handleEditorChanged: debounce(
      function handleEditorChanged(contents) {
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
    handleEditorCreated(editor, monaco) {
      function handleValidation(validationErrors: string[]) {
        monaco.editor.setModelMarkers(
          editor.getModel(),
          'app-yaml-editor',
          getValidationMarkers({
            monaco,
            validationErrors,
            text: editor.getValue(),
          }),
        )
      }

      this.subscriptions.add(
        handleConfigUpdated(({ validationErrors }) => {
          handleValidation(validationErrors)
        }),
      )
      const onChangeDisposable = editor.onDidChangeModelContent(() => {
        onChangeDisposable.dispose()
        handleValidation(this.configValidationErrors)
      })
    },
  },
  created() {
    fetch('/api/configRaw')
      .then(response => response.text())
      .then(contents => {
        this.configContents = contents
      })
  },
  data: () => ({
    subscriptions: new CompositeDisposable(),
    configContents: '',
    iconBackSource,
    iconCircleCheck,
    iconCircleTimes,
  }),
  destroyed() {
    this.subscriptions.dispose()
  },
}
</script>

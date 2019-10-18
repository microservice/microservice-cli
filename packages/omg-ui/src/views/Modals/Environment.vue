<template>
  <Flex :flex="1" column>
    <Flex column height="auto">
      <Flex :ph="2" :pv="1.5" :bb="1" row background-color="white" min-height="24px">
        <Button :onPress="dismissModal" v-if="appStatus === 'started'">
          <Photo :size="3" :source="iconClose" />
        </Button>
      </Flex>
    </Flex>
    <Flex :flex="1" row overflow="hidden">
      <Flex :p="2" column background-color="grey10" width="25%">
        <Flex :p="4" :pr="0" :flex="1" column height="auto" background-color="white">
          <Flex v-if="configEnvs.length" column height="auto">
            <Flex row>
              <Words size="xLarge" font-weight="500">Environment</Words>
            </Flex>
            <Flex :mt="1" row>
              <Words>Enter environment variables for your app below.</Words>
            </Flex>
            <Flex :mt="6" column>
              <Flex :mb="2" v-bind:key="envVar.name" v-for="envVar in configEnvs" column>
                <Flex row>
                  <Words color="grey60" size="small">
                    {{ envVar.name }}
                    <span v-if="envVar.required">*</span>
                  </Words>
                </Flex>
                <Flex :mt="0.5" row>
                  <input
                    v-bind:name="envVar.name"
                    v-bind:value="configEnvValues[envVar.name]"
                    @input="setEnvVar"
                    class="modal-env-input"
                    type="text"
                    placeholder="String"
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Flex :mt="1" column>
            <Button
              :pv="1"
              :onPress="handleBuild"
              color="white"
              justify-content="center"
              background-color="teal60"
            >Save and Rebuild</Button>
          </Flex>
          <Flex :mt="4" v-if="showRebuildingMessage" column>
            <Flex row justify-content="center" color="teal60">
              <Words>Rebuilding</Words>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex :ph="4" :pv="6" :flex="1" column background-color="white" overflow="hidden">
        <Flex row>
          <Words size="xLarge" font-weight="500">Docker Logs</Words>
          <Flex :ml="3" :pv="0.5" :ph="1.5" row background-color="teal20">
            <Words size="small" color="teal80" font-weight="500">$ docker inspect</Words>
          </Flex>
        </Flex>
        <Flex
          key="env-logs-non-empty"
          :mt="3"
          v-if="logsAllReverse.length"
          column
          overflow-y="auto"
        >
          <Words color="grey60">
            <pre v-text="logsAllReverse" class="modal-env-logs" />
          </Words>
        </Flex>
        <Flex
          key="env-logs-empty"
          :mt="3"
          :flex="1"
          v-if="!logsAllReverse.length"
          column
          align-items="center"
          justify-content="center"
        >
          <Words size="large">There's nothing to show here yet.</Words>
          <Words size="large">Try adding some environment variables and hitting Save & Rebuild!</Words>
        </Flex>
      </Flex>
    </Flex>
  </Flex>
</template>

<script lang="ts">
import { mapMutations, mapGetters } from 'vuex'

import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Photo from '~/components/Photo.vue'

import iconClose from '~/images/icon-close.svg'

import { buildImage } from '~/rpc'
import { AppStatus } from '~/types'

export default {
  components: { Flex, Button, Words, Photo },
  methods: {
    ...mapMutations(['dismissModal', 'setConfigEnv']),
    setEnvVar(e) {
      this.setConfigEnv({
        key: e.target.name,
        value: e.target.value,
      })
    },
    handleBuild() {
      buildImage()
    },
  },
  computed: {
    ...mapGetters(['logsAllReverse', 'appStatus']),
    ...mapGetters({
      configEnvs: 'getConfigEnvs',
      configEnvValues: 'getConfigEnvValues',
    }),
    showRebuildingMessage() {
      return this.appStatus === AppStatus.starting
    },
  },
  data: () => ({
    iconClose,
  }),
}
</script>
<style lang="less" scoped>
.modal-env-input {
  padding: 12px;
  display: flex;
  flex: 1;
}
.modal-env-logs {
  font-family: Graphik;
}
</style>

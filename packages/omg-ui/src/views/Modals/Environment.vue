<template>
  <Flex column :flex="1">
    <Flex column>
      <Flex row :ph="2" :pv="1.5" :bb="1" backgroundColor="white">
        <Button :onPress="dismissModal">
          <Photo :size="3" :source="iconCloseSource" />
        </Button>
      </Flex>
    </Flex>
    <Flex row :flex="1" overflow="hidden">
      <Flex column backgroundColor="grey10" :p="2" width="25%">
        <Flex column backgroundColor="white" :p="4" :flex="1">
          <Flex column v-if="configEnvs.length">
            <Flex row>
              <Words size="xLarge" fontWeight="500">Environment</Words>
            </Flex>
            <Flex row :mt="1">
              <Words>Enter environment variables for your app below.</Words>
            </Flex>
            <Flex column :mt="6">
              <Flex column :mb="2" v-bind:key="envVar.name" v-for="envVar in configEnvs">
                <Flex row>
                  <Words color="grey60" size="small">
                    {{envVar.name}}
                    <span v-if="envVar.required">*</span>
                  </Words>
                </Flex>
                <Flex row :mt="0.5">
                  <input
                    class="modal-env-input"
                    type="text"
                    placeholder="String"
                    v-bind:name="envVar.name"
                    v-bind:value="configEnvValues[envVar.name]"
                    @input="setEnvVar"
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Flex column :mt="1">
            <Button
              :pv="1"
              color="white"
              justifyContent="center"
              backgroundColor="teal60"
              :onPress="handleBuild"
            >Save and Rebuild</Button>
          </Flex>
          <Flex column :mt="4" v-if="showRebuildingMessage">
            <Flex row justifyContent="center" color="teal60">
              <Words>Rebuilding</Words>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex column :ph="4" :pv="6" :flex="1" backgroundColor="white" overflow="hidden">
        <Flex row>
          <Words size="xLarge" fontWeight="500">Docker Logs</Words>
          <Flex row :ml="3" :pv="0.5" :ph="1.5" backgroundColor="teal20">
            <Words size="small" color="teal80" fontWeight="500">$ docker inspect</Words>
          </Flex>
        </Flex>
        <Flex column :mt="3" overflowY="scroll">
          <Words color="grey60">
            <pre class="modal-env-logs" v-text="logsAllReverse"></pre>
          </Words>
        </Flex>
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
    iconCloseSource: require('~/images/icon-close.svg'),
  }),
}
</script>
<style lang="less">
.modal-env-input {
  padding: 12px;
  display: flex;
  flex: 1;
}
.modal-env-logs {
  font-family: Graphik;
}
</style>

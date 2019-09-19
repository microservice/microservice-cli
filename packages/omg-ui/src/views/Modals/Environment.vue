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
      <Flex column backgroundColor="grey10" :p="2">
        <Flex column backgroundColor="white" :p="4" :flex="1">
          <Flex row>
            <Words size="xLarge" fontWeight="500">Environemnt</Words>
          </Flex>
          <Flex row :mt="1">
            <Words>Enter environemt variables for your app below.</Words>
          </Flex>
          <Flex column :mt="6">
            <Flex column :mb="2">
              <Flex row>
                <Words color="grey60" size="small">Account_ID</Words>
              </Flex>
              <Flex row :mt="0.5">
                <input class="modal-env-input" type="text" placeholder="String" />
              </Flex>
            </Flex>
            <Flex column :mb="2">
              <Flex row>
                <Words color="grey60" size="small">Account_Passcode</Words>
              </Flex>
              <Flex row :mt="0.5">
                <input class="modal-env-input" type="text" placeholder="String" />
              </Flex>
            </Flex>
            <Flex column :mt="1">
              <Button
                :pv="1"
                color="white"
                justifyContent="center"
                backgroundColor="teal60"
              >Save and Rebuild</Button>
            </Flex>
            <Flex column :mt="4">
              <Flex row justifyContent="center" color="teal60">
                <Words>Auto Rebuilding</Words>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex column :ph="4" :pv="6" :flex="1" backgroundColor="white" overflow="hidden">
        <Flex row>
          <Words size="xLarge" fontWeight="500">Docker Logs</Words>
          <Flex row :ml="3" :pv="0.5" :ph="1.5" backgroundColor="teal20">
            <Words size="small" color="teal70" fontWeight="500">$ docker inspect</Words>
          </Flex>
        </Flex>
        <Flex column :mt="3" overflowY="scroll">
          <Words color="grey60">
            <pre class="modal-env-logs">Web client connected to socket.
            ^C(node:11024) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'isRunning' of undefined
            at UIServer.anonymous (/usr/local/lib/node_modules/omg/dist/commands/ui/UI.js:383:45)
            at Generator.next (anonymous)
            at /usr/local/lib/node_modules/omg/dist/commands/ui/UI.js:7:71
            at new Promise (anonymous)
            at __awaiter (/usr/local/lib/node_modules/omg/dist/commands/ui/UI.js:3:12)
            at /usr/local/lib/node_modules/omg/dist/commands/ui/UI.js:380:49
            at new Promise (anonymous)
            at UIServer.stopContainer (/usr/local/lib/node_modules/omg/dist/commands/ui/UI.js:380:16)
            at Cli.anonymous (/usr/local/lib/node_modules/omg/dist/cli/Cli.js:572:37)
            at Generator.next (anonymous)Web client connected to socket.
            The end</pre>
          </Words>
        </Flex>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import { mapMutations } from 'vuex'
import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Button, Words, Photo },
  methods: {
    ...mapMutations(['dismissModal']),
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

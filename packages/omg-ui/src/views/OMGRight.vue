<template>
  <Flex column backgroundColor="grey10" width="16%" height="100%">
    <Flex column :flex="1" :bl="1" height="100%">
      <Flex row :bv="1" :ph="1" :pv="1.125">
        <Button :ph="3" :pv="1" bold color="grey70">
          <Photo :source="iconFileCodeSource" :size="3" :mr="1" />Setup
        </Button>
        <Button :ph="3" :pv="1" bold color="grey70">
          <Photo :source="iconBookmarkSource" :size="3" :mr="1" />Edit the YAML
        </Button>
      </Flex>
      <Flex column backgroundColor="white" :flex="1" :ph="2" :pv="3" height="100%">
        <Words fontWeight="500" size="large">Container Logs (stdout &amp; stderr)</Words>
        <Words color="grey60" marginTop="12px" height="100%" overflowY="scroll">
          Web client connected to socket.
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
          at Generator.next (anonymous)
        </Words>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import Flex from '~/components/Flex.vue'
import Button from '~/components/Button.vue'
import Words from '~/components/Words.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Button, Words, Photo },
  methods: {},
  data: () => ({
    iconBookmarkSource: require('~/images/icon-bookmark.svg'),
    iconFileCodeSource: require('~/images/icon-file-code.svg'),
  }),
}
</script>

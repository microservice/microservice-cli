<template>
  <Flex column backgroundColor="grey10" overflow="hidden">
    <Flex row :bv="1">
      <Flex row :mt="1.5" :mh="2" width="calc(100% - 24px)" overflowY="auto">
        <Button
          :pl="3"
          :pv="1.5"
          :b="1"
          :mr="1"
          minWidth="100px"
          borderBottom="none"
          backgroundColor="white"
          color="blue"
          class="tab"
          v-bind:key="tab.id"
          v-for="tab in allActionTabs"
          v-bind:class="{'tab-active': tab.id === activeActionTab.id}"
          v-bind:onPress="e => selectActionsTab(tab.id)"
        >
          <span>{{tab.title}}</span>
          <Photo
            class="close-button"
            align-items="flex-end"
            v-if="showTabCloseButton"
            :flex="1"
            :mr="1"
            :source="iconCloseSource"
            :size="2"
            :onPress="(e) => handleTabClosePress(e, tab.id)"
          />
        </Button>
        <Button
          :ph="1.5"
          :pv="0.5"
          :b="1"
          :mr="1"
          borderBottom="none"
          bordercolor="blue20"
          backgroundColor="blue10"
          :onPress="createActionsTab"
        >
          <Photo :source="iconPlusSource" :size="3" />
        </Button>
      </Flex>
    </Flex>
    <Flex row :ph="2" :pv="2">
      <Flex row :flex="1">
        <VSelect
          class="center-tab-vselect"
          placeholder="Please select an Action"
          @input="selectAction"
          :value="activeActionTab.actionName"
          :options="configActions.map(item => item.name)"
        />
        <Button
          :ph="2"
          :pv="1.5"
          color="white"
          backgroundColor="blue50"
          :ml="1"
          :onPress="executeActiveAction"
          :disabled="!allowActionSend"
        >Send</Button>
        <Button
          :ph="2"
          :pv="1.5"
          :ml="1"
          :b="1"
          color="blue60"
          fontWeight="500"
          bordercolor="blue20"
          backgroundColor="blue20"
          :onPress="saveActiveAction"
          :disabled="!allowActionSave"
        >Save</Button>
      </Flex>
      <Flex row :flex="1" :ml="2" justifyContent="flex-end">
        <Button :pv="1" bold color="grey70" :onPress="openEnvironmentModal">
          <Photo :source="iconFileCodeSource" :size="3" :mr="1" />Setup
        </Button>
        <Button :pl="3" :pv="1" bold color="grey70" :onPress="openYamlEditorModal">
          <Photo :source="iconBookmarkSource" :size="3" :mr="1" />Edit the YAML
        </Button>
      </Flex>
    </Flex>
    <Flex row :ph="2" :pv="1" :flex="1" height="100%">
      <Flex column width="calc(50% - 12px)" backgroundColor="white">
        <Flex row :pv="1" :ph="2.5" :bb="1" alignItems="center">
          <Words size="medium" fontWeight="500">Request</Words>
          <Flex row :flex="1" justifyContent="flex-end" v-if="copySupported">
            <Flex
              row
              :b="1"
              :ph="1"
              :pv="0.5"
              v-on:click="handleCopyPayload"
              boxShadow="0px 1px 5px rgba(24, 59, 140, 0.2)"
              cursor="pointer"
              userSelect="none"
            >
              <Words size="small">Copy</Words>
            </Flex>
          </Flex>
        </Flex>
        <Flex column :flex="1" :p="4">
          <Monaco language="json" :code="activeActionTab.payload" :onChange="setActionPayload" />
        </Flex>
      </Flex>
      <Flex :ph="0.5">
        <Photo :source="iconResizeKnobSource" :width="2" :height="2" class="editor-resize-knob" />
      </Flex>
      <Flex column width="calc(50% - 12px)" backgroundColor="white">
        <Flex row :pv="1" :ph="2.5" :bb="1" alignItems="center">
          <Words size="medium" fontWeight="500">Result</Words>
          <Flex row :flex="1" justifyContent="flex-end" v-if="copySupported">
            <Flex
              row
              :b="1"
              :ph="1"
              :pv="0.5"
              v-on:click="handleCopyResult"
              boxShadow="0px 1px 5px rgba(24, 59, 140, 0.2)"
              cursor="pointer"
              userSelect="none"
            >
              <Words size="small">Copy</Words>
            </Flex>
          </Flex>
        </Flex>
        <Flex column :flex="1" :ph="4" :pv="2">
          <Monaco language="json" readonly :code="activeActionTab.result" />
        </Flex>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import VSelect from 'vue-select'
import { mapGeters, mapGetters, mapMutations, mapActions } from 'vuex'

import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Words from '~/components/Words.vue'
import Button from '~/components/Button.vue'
import Monaco from '~/components/Monaco.vue'

export default {
  components: { Flex, Photo, Words, Button, Monaco, VSelect },
  computed: {
    ...mapGetters({
      showLogs: 'getShowLogs',
      configActions: 'getConfigActions',
      allActionTabs: 'getAllActionTabs',
      activeActionTab: 'getActiveActionTab',
    }),
    showTabCloseButton(state) {
      return state.allActionTabs.length > 1
    },
    allowActionSend() {
      return !!this.activeActionTab.actionName
    },
    allowActionSave() {
      return !!this.activeActionTab.actionName
    },
  },
  methods: {
    ...mapMutations([
      'createActionsTab',
      'selectActionsTab',
      'destroyActionsTab',
      'selectAction',
      'setActionPayload',
      'saveActiveAction',
      'openEnvironmentModal',
      'openYamlEditorModal',
    ]),
    ...mapActions(['executeActiveAction']),
    handleTabClosePress(event, tabId) {
      event.stopImmediatePropagation()
      this.destroyActionsTab(tabId)
    },
    handleCopyPayload() {
      navigator.clipboard.writeText(this.activeActionTab.payload)
      this.$toasted.show('Copied Payload to Clipboard', {
        type: 'success',
        position: 'bottom-center',
        duration: 1500,
      })
    },
    handleCopyResult() {
      navigator.clipboard.writeText(this.activeActionTab.result)
      this.$toasted.show('Copied Result to Clipboard', {
        type: 'success',
        position: 'bottom-center',
        duration: 1500,
      })
    },
  },
  data: () => ({
    copySupported: !!(navigator.clipboard && navigator.clipboard.writeText),
    iconPlusSource: require('~/images/icon-plus.svg'),
    iconCloseSource: require('~/images/icon-close.svg'),
    iconBookmarkSource: require('~/images/icon-bookmark.svg'),
    iconFileCodeSource: require('~/images/icon-file-code.svg'),
    iconResizeKnobSource: require('~/images/icon-resize-knob.svg'),
  }),
}
</script>
<style lang="less" scoped>
.tab {
  .close-button {
    display: none !important;
  }
  &:hover .close-button {
    display: flex !important;
  }
}
.tab-active {
  border-top: 3px solid #477bf3 !important;
}
.editor-resize-knob {
  transform: rotate(90deg);
}
</style>
<style lang="less">
.center-tab-vselect {
  background-color: white;
  width: 100%;
  box-shadow: 0px 1px 5px rgba(24, 59, 140, 0.2);

  .vs__dropdown-toggle {
    height: 100%;
    border: none;
    border-radius: 0;
  }
  .vs__dropdown-menu {
    border: none;
  }
  &.vs--open .vs__selected {
    font-size: 10px;
    margin-left: 4px;
  }
}
</style>

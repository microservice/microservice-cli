<template>
  <Flex
    column
    background-color="grey10"
    overflow="hidden"
  >
    <Flex
      :bv="1"
      row
    >
      <Flex
        :mt="1.5"
        :mh="2"
        row
        width="calc(100% - 24px)"
        overflow-y="auto"
      >
        <Button
          :pl="3"
          :pv="1.5"
          :b="1"
          :mr="1"
          v-bind:key="tab.id"
          v-for="tab in allActionTabs"
          v-bind:class="{'tab-active': tab.id === activeActionTab.id}"
          v-bind:onPress="e => selectActionsTab(tab.id)"
          min-width="100px"
          border-bottom="none"
          background-color="white"
          color="blue"
          class="tab"
        >
          <span>{{ tab.title }}</span>
          <Photo
            v-if="showTabCloseButton"
            :flex="1"
            :mr="1"
            :source="iconClose"
            :size="2"
            :onPress="(e) => handleTabClosePress(e, tab.id)"
            class="close-button"
            align-items="flex-end"
          />
        </Button>
        <Button
          :ph="1.5"
          :pv="0.5"
          :b="1"
          :mr="1"
          :onPress="createActionsTab"
          border-bottom="none"
          bordercolor="blue20"
          background-color="blue10"
        >
          <Photo
            :source="iconPlus"
            :size="3"
          />
        </Button>
      </Flex>
    </Flex>
    <Flex
      :ph="2"
      :pv="2"
      row
    >
      <Flex
        :flex="1"
        row
      >
        <VSelect
          @input="selectAction"
          :value="activeActionTab.actionName"
          :options="configActions.map(item => item.name)"
          class="center-tab-vselect"
          placeholder="Please select an Action"
        />
        <Button
          :ph="2"
          :pv="1.5"
          :ml="1"
          :onPress="executeActiveAction"
          :disabled="!allowActionSend"
          color="white"
          background-color="blue50"
        >
          Send
        </Button>
        <Button
          :ph="2"
          :pv="1.5"
          :ml="1"
          :b="1"
          :onPress="saveActiveAction"
          :disabled="!allowActionSave"
          color="blue60"
          font-weight="500"
          bordercolor="blue20"
          background-color="blue20"
        >
          Save
        </Button>
      </Flex>
      <Flex
        :flex="1"
        :ml="2"
        row
        justify-content="flex-end"
      >
        <Button
          :pv="1"
          :onPress="openEnvironmentModal"
          bold
          color="grey70"
        >
          <Photo
            :source="iconFileCode"
            :size="3"
            :mr="1"
          />Setup
        </Button>
        <Button
          :pl="3"
          :pv="1"
          :onPress="openYamlEditorModal"
          bold
          color="grey70"
        >
          <Photo
            :source="iconBookmark"
            :size="3"
            :mr="1"
          />Edit the YAML
        </Button>
      </Flex>
    </Flex>
    <Flex
      :ph="2"
      :pv="1"
      :flex="1"
      row
      height="100%"
    >
      <Request />
      <Flex :ph="0.5">
        <Photo
          :source="iconResizeKnob"
          :width="2"
          :height="2"
          class="editor-resize-knob"
        />
      </Flex>
      <Response />
    </Flex>
  </Flex>
</template>

<script lang="ts">
import VSelect from 'vue-select'
import { mapGetters, mapMutations, mapActions } from 'vuex'

import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Button from '~/components/Button.vue'

import iconPlus from '~/images/icon-plus.svg'
import iconClose from '~/images/icon-close.svg'
import iconBookmark from '~/images/icon-bookmark.svg'
import iconFileCode from '~/images/icon-file-code.svg'
import iconResizeKnob from '~/images/icon-resize-knob.svg'

import Request from './Request.vue'
import Response from './Response.vue'

export default {
  components: { Flex, Photo, Button, VSelect, Request, Response },
  computed: {
    ...mapGetters({
      showLogs: 'getShowLogs',
      configActions: 'getConfigActions',
      allActionTabs: 'getAllActionTabs',
      activeActionTab: 'getActiveActionTab',
    }),
    showTabCloseButton() {
      return this.allActionTabs.length > 1
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
      'saveActiveAction',
      'openEnvironmentModal',
      'openYamlEditorModal',
    ]),
    ...mapActions(['executeActiveAction']),
    handleTabClosePress(event, tabId) {
      event.stopImmediatePropagation()
      this.destroyActionsTab(tabId)
    },
  },
  data: () => ({
    iconPlus,
    iconClose,
    iconBookmark,
    iconFileCode,
    iconResizeKnob,
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

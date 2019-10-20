<template>
  <div class="app-center">
    <div class="center-header">
      <div class="center-header-content">
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
          <div class="close-button-wrapper">
            <Photo
              :source="iconClose"
              :size="2"
              :onPress="(e) => handleTabClosePress(e, tab.id)"
              class="close-button"
            />
          </div>
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
          <Photo :source="iconPlus" :size="3" />
        </Button>
      </div>
    </div>
    <div class="center-actions">
      <div class="center-actions-left">
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
        >Send</Button>
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
        >Save</Button>
      </div>
      <div class="center-actions-right">
        <Button :pv="1" :onPress="openEnvironmentModal" bold color="grey70">
          <Photo :source="iconFileCode" :size="3" :mr="1" />Setup
        </Button>
        <Button :pl="3" :pv="1" :onPress="openYamlEditorModal" bold color="grey70">
          <Photo :source="iconBookmark" :size="3" :mr="1" />Edit the YAML
        </Button>
      </div>
    </div>
    <div class="center-editors">
      <Request />
      <div class="center-editors-resize">
        <Photo :source="iconResizeKnob" :width="2" :height="2" class="knob" />
      </div>
      <Response />
    </div>
  </div>
</template>

<script lang="ts">
import VSelect from 'vue-select'
import { mapGetters, mapMutations, mapActions } from 'vuex'

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
  components: { Photo, Button, VSelect, Request, Response },
  computed: {
    ...mapGetters({
      showLogs: 'getShowLogs',
      configActions: 'getConfigActions',
      allActionTabs: 'getAllActionTabs',
      activeActionTab: 'getActiveActionTab',
    }),
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
<style lang="scss" scoped>
@use "~/styles/mixins" as *;
@use "~/styles/variables" as *;
.app-center {
  background-color: $grey10;
  @include flex($column: true, $grow: 1);
}
.center-header {
  @include flex($row: true);
  @include border($bv: 1);
}
.center-header-content {
  width: calc(100% - 24px);
  overflow-y: auto;
  @include flex($row: true, $mt: 1.5, $mh: 2);
}
.center-actions {
  @include flex($row: true, $ph: 2, $pv: 2);
}
.center-actions-left {
  @include flex($row: true, $flex: 1);
}
.center-actions-right {
  justify-content: flex-end;
  @include flex($row: true, $flex: 1, $ml: 2);
}
.center-editors {
  @include flex($row: true, $flex: 1, $ph: 2, $pv: 1);
}
.center-editors-resize {
  justify-content: center;
  @include flex($column: true, $ph: 0.5);

  .knob {
    user-select: none;
    transform: rotate(90deg);
  }
}
.tab {
  .close-button-wrapper {
    justify-content: flex-end;
    @include flex($row: true, $flex: 1, $mr: 1);
  }
  .close-button {
    display: none !important;
  }
  &:hover .close-button {
    display: flex !important;
  }
  &.tab-active {
    border-top: 3px solid #477bf3 !important;
  }
}
</style>
<style lang="scss">
.center-tab-vselect {
  width: 100%;
  display: flex;
  background-color: white;
  box-shadow: 0px 1px 5px rgba(24, 59, 140, 0.2);

  .vs__dropdown-toggle {
    flex: 1;
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

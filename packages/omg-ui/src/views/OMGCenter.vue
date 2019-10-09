<template>
  <Flex column backgroundColor="grey10" :flex="1" overflow="hidden">
    <Flex column :bv="1">
      <Flex row :mt="1.5" :mh="2" overflow-x="scroll" width="calc(100% - 32px)">
        <Button
          :pl="3"
          :pv="1.5"
          :b="1"
          :mr="1"
          minWidth="80px"
          width="100px"
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
          backgroundColor="blue20"
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
      <Flex row :flex="1" :ml="2" />
    </Flex>
    <Flex row :ph="2" :pv="1" :flex="1">
      <Flex column :flex="1" backgroundColor="white">
        <Flex row :pv="2" :ph="2.5" :bb="1" alignItems="center">
          <Words size="medium" fontWeight="500">Request</Words>
        </Flex>
        <Flex column :flex="1" :p="4">
          <Monaco language="json" :code="activeActionTab.payload" :onChange="setActionPayload" />
        </Flex>
      </Flex>
      <Flex column :flex="1" :ml="2" backgroundColor="white">
        <Flex row :pv="2" :ph="2.5" :bb="1" alignItems="center">
          <Words size="medium" fontWeight="500">Result</Words>
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
      activeActionTab: 'getActiveActionTab',
      allActionTabs: 'getAllActionTabs',
      configActions: 'getConfigActions',
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
    ]),
    ...mapActions(['executeActiveAction']),
    handleTabClosePress(event, tabId) {
      event.stopImmediatePropagation()
      this.destroyActionsTab(tabId)
    },
  },
  data: () => ({
    iconPlusSource: require('~/images/icon-plus.svg'),
    iconCloseSource: require('~/images/icon-close.svg'),
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

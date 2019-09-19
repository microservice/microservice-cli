<template>
  <Flex column backgroundColor="grey10" :flex="1">
    <Flex row :bv="1" :pt="1.5" :ph="2">
      <Button
        :ph="3"
        :pv="1.5"
        :b="1"
        :mr="1"
        borderBottom="none"
        backgroundColor="white"
        color="blue"
        v-bind:key="tab.id"
        v-for="tab in getAllActionTabs"
        v-bind:class="{'omg-center-tab-active': tab.id === getActiveActionTab.id}"
        v-bind:onPress="e => selectActionsTab(tab.id)"
      >{{tab.title}}</Button>
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
    <Flex row :ph="2" :pv="2">
      <Flex row :flex="1">
        <select
          class="omg-center-action-select"
          placeholder="Please select an Action"
          v-model="getActiveActionTab.actionName"
          v-on:change="e => selectAction(e.target.value)"
        >
          <option :value="null" hidden disabled>Please select an Action</option>
          <option
            :value="configAction.name"
            v-bind:key="configAction.name"
            v-for="configAction in getConfigActions"
          >{{configAction.name}}</option>
        </select>
        <Button :ph="2" :pv="1.5" color="white" backgroundColor="blue40" :ml="1">Send</Button>
        <Button
          :ph="2"
          :pv="1.5"
          :ml="1"
          :b="1"
          color="blue40"
          bordercolor="blue20"
          backgroundColor="blue10"
        >Save</Button>
      </Flex>
      <Flex row :flex="1" :ml="2" />
    </Flex>
    <Flex row :ph="2" :pv="1" :flex="1">
      <Flex column :flex="1" backgroundColor="white">
        <Flex column :flex="1" :p="4">
          <Monaco :code="getActiveActionTab.payload" />
        </Flex>
      </Flex>
      <Flex column :flex="1" :ml="2" backgroundColor="white">
        <Flex row :pv="2" :ph="2.5" :bb="1" alignItems="center">
          <Words size="medium" fontWeight="500">Result</Words>
        </Flex>
        <Flex column :flex="1" :ph="4" :pv="2">
          <Monaco readonly :code="getActiveActionTab.result" />
        </Flex>
      </Flex>
    </Flex>
  </Flex>
</template>

<script>
import { mapGeters, mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Photo from '~/components/Photo.vue'
import Words from '~/components/Words.vue'
import Button from '~/components/Button.vue'
import Monaco from '~/components/Monaco.vue'

export default {
  components: { Flex, Photo, Words, Button, Monaco },
  computed: {
    ...mapGetters(['getActiveActionTab', 'getAllActionTabs', 'getConfigActions']),
  },
  methods: {
    ...mapMutations(['createActionsTab', 'selectActionsTab', 'destroyActionsTab', 'selectAction']),
  },
  data: () => ({
    iconPlusSource: require('~/images/icon-plus.svg'),
  }),
}
</script>
<style lang="less">
.omg-center-tab-active {
  border-top: 3px solid #477bf3 !important;
}
.omg-center-action-select {
  width: 100%;
}
</style>

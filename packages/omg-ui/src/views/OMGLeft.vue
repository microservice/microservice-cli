<template>
  <Flex
    column
    backgroundColor="white"
    width="18%"
    :bt="1"
    boxShadow="4px 0px 5px rgba(0, 0, 0, 0.05)"
    zIndex="1"
  >
    <Flex column :pv="1" :ph="2">
      <Words color="grey90">History</Words>
      <Flex row :mt="1">
        <input type="text" placeholder="Filter" class="omg-left-search" v-model="searchTerm" />
      </Flex>
    </Flex>
    <Flex row backgroundColor="grey10" justifyContent="flex-end" :pv="0.5" :ph="2" :bv="1">
      <Button :onPress="clearHistoricTabs">
        <Words size="small">Clear all</Words>
      </Button>
    </Flex>
    <Flex column :p="3" :flex="1">
      <Flex column v-if="historicTabGroups.length" :flex="1">
        <Flex
          column
          v-for="historicTabGroup in historicTabGroups"
          v-bind:key="historicTabGroup.date"
        >
          <Flex row :pv="1" :bb="1">
            <Button :onPress="() => toggleExpanded(historicTabGroup.date)">
              <Photo
                :source="iconDropdownSource"
                :size="1"
                :mr="1"
                v-bind:class="{'omg-left-history-collapsed': !expanded.includes(historicTabGroup.date)}"
              />
              <Words>{{historicTabGroup.date}}</Words>
            </Button>
          </Flex>
          <Flex column v-if="expanded.includes(historicTabGroup.date)">
            <Flex
              row
              :pv="1"
              :pl="2"
              v-for="historicTab in historicTabGroup.items"
              v-bind:key="historicTab.id + historicTab.timestamp"
              class="omg-left-history-item"
            >
              <Button :onPress="() => {restoreHistoricTab(historicTab)}">
                <Words>{{historicTab.title || 'Action'}}</Words>
              </Button>
              <Photo
                :source="iconCircleTimes"
                :onPress="() => {destroyHistoricTab(historicTab.id)}"
                :size="1.5"
                marginLeft="auto"
                class="omg-left-history-delete"
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        column
        v-if="!historicTabGroups.length"
        :flex="1"
        justifyContent="center"
        alignItems="center"
      >
        <Words size="large">There's nothing to show here yet.</Words>
        <Words size="large">Try executing an Action or two!</Words>
      </Flex>
    </Flex>
  </Flex>
</template>
<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'
import { DateTime } from 'luxon'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Words, Button, Photo },
  methods: {
    ...mapMutations(['restoreHistoricTab', 'clearHistoricTabs', 'destroyHistoricTab']),
    toggleExpanded(label) {
      if (this.expanded.includes(label)) {
        this.expanded = this.expanded.filter(item => item !== label)
      } else {
        this.expanded.push(label)
      }
    },
  },
  computed: {
    ...mapGetters({
      historicTabsRaw: 'getHistoricTabs',
    }),
    historicTabGroups() {
      const dateToday = DateTime.local().startOf('day')
      const dateYesterday = dateToday.minus({ days: 1 })
      const searchTerm = this.searchTerm.toLowerCase()
      const dateGroups = {}

      let historicTabsRaw = this.historicTabsRaw.slice()
      if (searchTerm) {
        historicTabsRaw = historicTabsRaw.filter(
          item =>
            item.title.toLowerCase().includes(searchTerm) ||
            (item.actionName && item.actionName.toLowerCase().includes(searchTerm)),
        )
      }

      historicTabsRaw.sort((a, b) => b.timestamp - a.timestamp)

      historicTabsRaw.forEach(historicTab => {
        const actionDate = DateTime.fromMillis(historicTab.timestamp)

        let groupLabel
        if (actionDate.hasSame(dateToday, 'day')) {
          groupLabel = 'Today'
        } else if (actionDate.hasSame(dateYesterday, 'day')) {
          groupLabel = 'Yesterday'
        } else {
          groupLabel = actionDate.toFormat('yyyy LL dd')
        }

        if (!dateGroups[groupLabel]) {
          dateGroups[groupLabel] = []
        }
        dateGroups[groupLabel].push(historicTab)
      })

      const dateGroupsForView = []
      Object.keys(dateGroups).forEach(groupLabel => {
        dateGroupsForView.push({
          date: groupLabel,
          items: dateGroups[groupLabel],
        })
      })

      return dateGroupsForView
    },
  },
  data: () => ({
    searchTerm: '',
    expanded: ['Today', 'Yesterday'],
    iconDropdownSource: require('~/images/icon-dropdown.svg'),
    iconCircleTimes: require('~/images/icon-circle-times.svg'),
  }),
}
</script>
<style lang="less">
.omg-left-search {
  width: 100%;
  padding: 4px;
}
.omg-left-history-collapsed {
  transform: rotate(270deg);
}
.omg-left-history-item {
  .omg-left-history-delete {
    display: none !important;
  }
  &:hover {
    .omg-left-history-delete {
      display: flex !important;
    }
  }
}
</style>

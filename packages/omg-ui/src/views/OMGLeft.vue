<template>
  <Flex column backgroundColor="white" width="14%">
    <Flex column :pv="1" :ph="2">
      <Words color="grey90">History</Words>
      <Flex row :mt="1">
        <input type="text" placeholder="Filter" class="omg-left-search" />
      </Flex>
    </Flex>
    <Flex row backgroundColor="grey10" justifyContent="flex-end" :pv="0.5" :ph="2" :bv="1">
      <Button>
        <Words size="small">Clear all</Words>
      </Button>
    </Flex>
    <Flex column :p="3">
      <Flex column v-for="historicTabGroup in historicTabGroups" v-bind:key="historicTabGroup.date">
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
          >
            <Button :onPress="() => {restoreHistoricTab(historicTab)}">
              <Words>{{historicTab.name || 'Action'}}</Words>
            </Button>
          </Flex>
        </Flex>
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
    ...mapMutations(['restoreHistoricTab']),
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
      historicTabsRaw: 'historicTabs',
    }),
    historicTabGroups() {
      const dateToday = DateTime.local().startOf('day')
      const dateYesterday = dateToday.minus({ days: 1 })
      const dateGroups = {}

      this.historicTabsRaw.forEach(historicTab => {
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
    expanded: [],
    iconDropdownSource: require('~/images/icon-dropdown.svg'),
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
</style>

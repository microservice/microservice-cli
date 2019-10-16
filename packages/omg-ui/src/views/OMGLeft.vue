<template>
  <Flex
    column
    backgroundColor="white"
    width="18%"
    :bt="1"
    boxShadow="4px 0px 5px rgba(0, 0, 0, 0.05)"
    zIndex="1"
  >
    <Flex column :pv="1" :ph="2" height="auto">
      <Words color="grey90">History</Words>
      <Flex row :mt="1">
        <input type="text" placeholder="Filter" class="hsearch" v-model="searchTerm" />
        <Flex column height="auto" justifyContent="center" position="relative">
          <img :src="iconMagnifyingGlassSource" class="search-icon" />
        </Flex>
      </Flex>
    </Flex>
    <Flex row backgroundColor="grey10" justifyContent="flex-end" :pv="0.5" :ph="2" :bv="1">
      <Button :onPress="clearHistoricTabs">
        <Words size="small" :class="{'clear-all-dimmed': !historicTabs.length}">Clear all</Words>
      </Button>
    </Flex>
    <Flex column :p="3" :flex="1">
      <Flex key="hitems-non-empty" column v-if="historicTabs.length" :flex="1">
        <Flex
          row
          :pb="1"
          :pl="2"
          v-for="historicTab in historicTabs"
          v-bind:key="historicTab.id + historicTab.timestamp"
          class="hitem"
        >
          <Button :onPress="() => {restoreHistoricTab(historicTab)}">
            <Words>{{historicTab.title || 'Action'}}</Words>
          </Button>
          <Flex row :flex="1" justifyContent="flex-end">
            <Photo
              :source="iconBookmarkSource"
              :onPress="() => {toggleHistoricTabBookmark(historicTab.id)}"
              :size="1.5"
              :mr="1"
              :class="{'hitem-bookmark': true, 'hitem-bookmarked': historicTab.bookmark}"
            />
            <Photo
              :source="iconCircleTimesSource"
              :onPress="() => {destroyHistoricTab(historicTab.id)}"
              :size="1.5"
              :mr="1"
              class="hitem-delete"
            />
            <Words color="grey60">
              <Timeago :datetime="historicTab.timestamp" :auto-update="60" />
            </Words>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        key="hitems-empty"
        column
        v-if="!historicTabs.length"
        :flex="1"
        justifyContent="center"
        alignItems="center"
      >
        <Words size="large">There's nothing to show here yet.</Words>
        <Words
          size="large"
          v-text="searchTerm ? 'Try searching with something else!' : 'Try executing an Action or two!'"
        />
      </Flex>
    </Flex>
  </Flex>
</template>
<script lang="ts">
import { DateTime } from 'luxon'
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Words, Button, Photo },
  methods: {
    ...mapMutations(['restoreHistoricTab', 'clearHistoricTabs', 'destroyHistoricTab', 'toggleHistoricTabBookmark']),
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
    historicTabs() {
      const searchTerm = this.searchTerm.toLowerCase()
      let historicTabsRaw = this.historicTabsRaw.slice()

      if (searchTerm) {
        historicTabsRaw = historicTabsRaw.filter(
          item =>
            item.title.toLowerCase().includes(searchTerm) ||
            (item.actionName && item.actionName.toLowerCase().includes(searchTerm)),
        )
      }

      historicTabsRaw.sort((a, b) => b.timestamp - a.timestamp)

      return historicTabsRaw
    },
  },
  data: () => ({
    searchTerm: '',
    iconDropdownSource: require('~/images/icon-dropdown.svg'),
    iconCircleTimesSource: require('~/images/icon-circle-times.svg'),
    iconBookmarkSource: require('~/images/icon-bookmark.svg'),
    iconMagnifyingGlassSource: require('~/images/icon-magnifyingglass.svg'),
  }),
}
</script>
<style lang="less" scoped>
.hsearch {
  width: 100%;
  padding: 4px;
}
.hitem {
  .hitem-delete {
    display: none !important;
  }
  .hitem-bookmark {
    display: none !important;
    &:not(.hitem-bookmarked) {
      filter: invert(1);
    }
    &.hitem-bookmarked {
      display: flex !important;
    }
  }
  &:hover {
    .hitem-delete {
      display: flex !important;
    }
    .hitem-bookmark {
      display: flex !important;
    }
  }
}
.search-icon {
  position: absolute;
  width: 10px;
  height: 10px;
  left: -16px;
}
.clear-all-dimmed {
  color: #9aa5b1;
}
</style>

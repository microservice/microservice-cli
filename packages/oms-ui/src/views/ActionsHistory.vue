<template>
  <Flex
    :bt="1"
    column
    background-color="white"
    width="18%"
    box-shadow="4px 0px 5px rgba(0, 0, 0, 0.05)"
    z-index="1"
  >
    <Flex :pv="1" :ph="2" column height="auto">
      <Words color="grey90">History</Words>
      <Flex :mt="1" row>
        <input v-model="searchTerm" type="text" placeholder="Filter" class="hsearch" />
        <Flex column height="auto" justify-content="center" position="relative">
          <img :src="iconMagnifyingGlass" class="search-icon" />
        </Flex>
      </Flex>
    </Flex>
    <Flex :pv="0.5" :ph="2" :bv="1" row background-color="grey10" justify-content="flex-end">
      <Button :onPress="clearHistoricTabs">
        <Words :class="{'clear-all-dimmed': !historicTabs.length}" size="small">Clear all</Words>
      </Button>
    </Flex>
    <Flex :p="3" :flex="1" column>
      <Flex key="hitems-non-empty" v-if="historicTabs.length" :flex="1" column>
        <Flex
          :pb="1"
          :pl="2"
          v-for="historicTab in historicTabs"
          v-bind:key="historicTab.id + historicTab.timestamp"
          row
          class="hitem"
        >
          <Button :onPress="() => {restoreHistoricTab(historicTab)}" :flex="1">
            <Words>{{ historicTab.title || 'Action' }}</Words>
          </Button>
          <Flex row justify-content="flex-end">
            <div title="Bookmark this item">
              <Photo
                :source="iconBookmark"
                :onPress="() => {toggleHistoricTabBookmark(historicTab.id)}"
                :size="1.5"
                :mr="1"
                :class="{'hitem-bookmark': true, 'hitem-bookmarked': historicTab.bookmark}"
              />
            </div>
            <div title="Remove this item from history">
              <Photo
                :source="iconCircleTimes"
                :onPress="() => {destroyHistoricTab(historicTab.id)}"
                :size="1.5"
                :mr="1"
                class="hitem-delete"
              />
            </div>
            <Words color="grey60">
              <Timeago :datetime="historicTab.timestamp" :auto-update="60" />
            </Words>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        key="hitems-empty"
        v-if="!historicTabs.length"
        :flex="1"
        column
        justify-content="center"
        align-items="center"
      >
        <Words size="large">There's nothing to show here yet.</Words>
        <Words
          v-text="searchTerm ? 'Try searching with something else!' : 'Try executing an Action or two!'"
          size="large"
        />
      </Flex>
    </Flex>
  </Flex>
</template>
<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'

import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'

import iconBookmark from '~/images/icon-bookmark.svg'
import iconCircleTimes from '~/images/icon-circle-times.svg'
import iconMagnifyingGlass from '~/images/icon-magnifying-glass.svg'

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
    iconBookmark,
    iconCircleTimes,
    iconMagnifyingGlass,
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

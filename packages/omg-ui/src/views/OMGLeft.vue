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
      <Flex column>
        <Flex row :pv="1" :bb="1">
          <Button>
            <Photo :source="iconDropdownSource" :size="1" :mr="1" />
            <Words>Today</Words>
          </Button>
        </Flex>
        <Flex row :pv="1" :pl="2">
          <Button>
            <Words>/listProjects</Words>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  </Flex>
</template>
<script lang="ts">
import Flex from '~/components/Flex.vue'
import Words from '~/components/Words.vue'
import Button from '~/components/Button.vue'
import Photo from '~/components/Photo.vue'

export default {
  components: { Flex, Words, Button, Photo },
  data: () => ({
    iconDropdownSource: require('~/images/icon-dropdown.svg'),
  }),
}
</script>
<style lang="less">
.omg-left-search {
  width: 100%;
  padding: 4px;
}
</style>

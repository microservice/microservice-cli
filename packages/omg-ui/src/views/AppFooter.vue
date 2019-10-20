<template>
  <div class="app-footer">
    <div class="logs-wrapper" v-bind:class="{expanded: showLogs}">
      <div class="logs-header">
        <div>Container Logs</div>
        <Photo :source="iconResizeKnob" :width="1.5" :height="2" />
        <div class="logs-toggle">
          <ToggleVertical :enabled="showLogs" :onToggle="toggleShowLogs" />
        </div>
      </div>
      <div class="logs-container" v-if="showLogs">
        <pre v-text="logsAllReverse" class="logs-content" />
      </div>
    </div>
    <div class="actions">
      <ToggleHorizontal :enabled="showHistory" :onToggle="toggleShowHistory" />
      <div class="action-label-history">Show History</div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapMutations } from 'vuex'

import Photo from '~/components/Photo.vue'
import ToggleVertical from '~/components/ToggleVertical.vue'
import ToggleHorizontal from '~/components/ToggleHorizontal.vue'

import iconResizeKnob from '~/images/icon-resize-knob.svg'

export default {
  components: { Photo, ToggleVertical, ToggleHorizontal },
  data: () => ({
    iconResizeKnob,
  }),
  computed: {
    ...mapGetters({
      showLogs: 'getShowLogs',
      showHistory: 'getShowHistory',
      logsAllReverse: 'logsAllReverse',
    }),
  },
  methods: {
    ...mapMutations(['toggleShowHistory', 'toggleShowLogs']),
  },
}
</script>
<style lang="scss" scoped>
@use "~/styles/mixins" as *;
@use "~/styles/variables" as *;

.app-footer {
  max-height: 20%;
  overflow: hidden;
  @include flex($column: true);
}
.logs-wrapper {
  min-height: 0;
  @include border($bv: 1);
  @include flex($column: true);

  &.expanded {
    height: 100%;
    .logs-container {
      height: 100%;
    }
  }
}
.logs-header {
  justify-content: space-between;
  @include flex($row: true, $ph: 2, $pv: 1);
}
.logs-toggle {
  @include flex($row: true, $mr: 1);
}
.logs-container {
  color: $grey60;
  overflow: hidden;
  @include border($bt: 1);
  @include flex($column: true, $flex: 1, $pl: 2);
}
.logs-content {
  overflow: auto;
  @include flex($column: true, $flex: 1);
}
.actions {
  min-height: 18px;
  user-select: none;
  @include flex($row: true, $ph: 2, $pv: 1);
}
.action-label-history {
  @include text-small;
  @include flex($row: true, $ml: 1);
}
</style>

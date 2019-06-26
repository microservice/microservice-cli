<template>
  <div class="rebuild-container">
    <div class="title">Auto Rebuild</div>
    <toggle-button
      :toggleHandler="toggleDockerRebuild"
      :toggleReceiver="getDockerRebuild"
    ></toggle-button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ToggleButton from '@/components/ToggleButton'

export default {
  name: 'rebuild',
  components: {
    ToggleButton
  },
  computed: {
    ...mapGetters(['getDockerRebuild', 'getSocket'])
  },
  methods: {
    ...mapMutations(['toggleDockerRebuild'])
  },
  watch: {
    getDockerRebuild: function () {
      this.getSocket.emit('rebuild-toggle', this.getDockerRebuild)
    }
  }
}
</script>

<style lang="scss" scoped>
.rebuild-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-right: 24px;

  .title {
    text-transform: uppercase;
    height: 21px;
    color: #1f2933;
    font-family: Graphik;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
    line-height: 21px;
    margin-right: 8px;
  }

  .switch {
    cursor: pointer;

    .rectangle {
      height: 21px;
      width: 43px;
      border-radius: 10.5px;
      background-color: #477bf3;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      &.off {
        background-color: #bacfff;
        justify-content: flex-start;
      }

      .circle {
        width: 15.3px;
        height: 15.4px;
        box-shadow: 0 4px 10px 0 rgba(11, 25, 69, 0.5);
        background-color: #ffffff;
        border-radius: 50%;
        margin: 0 2.74px;
      }
    }
  }
}
</style>

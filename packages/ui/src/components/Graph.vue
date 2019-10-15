<template>
  <div class="graph-container">
    <div class="bar-wrapper" v-if="values.length > 0 && !biDataMode">
      <div
        :id="`bar-${index + 1}`"
        class="bar"
        v-for="(v, index) of values"
        :key="`${index}`"
        :style="{
          height: `${v / (lastMax / 25) < 1 ? 1 : v / (lastMax / 25)}px`
        }"
      ></div>
    </div>
    <div
      class="bar-wrapper"
      v-if="values.length > 0 && biDataMode"
      :class="{ biData: biDataMode }"
    >
      <div
        class="bar-line"
        :id="`bar-${index + 1}`"
        v-for="(v, index) of values"
        :key="`${index}`"
      >
        <div
          class="bar up"
          :style="{
            height: `${v.up / (lastMax / 25) < 1 ? 1 : v.up / (lastMax / 25)}px`
          }"
        ></div>
        <div
          class="bar down"
          :style="{
            height: `${
              v.down / (lastMax / 25) < 1 ? 1 : v.down / (lastMax / 25)
            }px`
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'graph',
  data: () => ({
    lastMax: 1,
    toDelete: 1
  }),
  props: {
    values: {
      type: Array,
      required: true
    },
    biDataMode: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  watch: {
    values: function () {
      if (this.biDataMode) {
        const max = this.values[this.values.length - 1].up > this.values[this.values.length - 1].down
          ? this.values[this.values.length - 1].up
          : this.values[this.values.length - 1].down
        if (parseFloat(this.lastMax) < parseFloat(max)) {
          this.lastMax = max * 2.0
        }
      } else {
        if (this.lastMax < this.values[this.values.length - 1]) {
          this.lastMax = this.values[this.values.length - 1]
        }
      }
      if (this.values.length > 63) {
        this.$el.querySelector(`#bar-${this.toDelete}`).remove()
        this.toDelete += 1
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.graph-container {
  height: 27px;
  width: 252px;
  border-radius: 2px;
  background-color: #f5f7fa;

  .bar-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 100%;

    .bar {
      width: 2px;
      border-radius: 1px;
      background-color: #477bf3;
      margin-right: 2px;
    }

    &.biData {
      align-items: center;

      .bar-line {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: center;

        .up {
          background-color: #079a82;
        }
        .down {
          background-color: #a61b1b;
        }
      }
    }
  }
}
</style>

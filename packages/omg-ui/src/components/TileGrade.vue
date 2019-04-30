<template>
  <div class="tile-grade-container">
    <div
      class="rectangle"
      :class="state === 'good' ? 'good' : state === 'warn' ? 'warn' : 'error'"
    >
      <span class="title">{{ title }}</span>
      <span class="icon">
        <img
          src="../assets/ic-tick.svg"
          alt="icon-good"
          v-if="state === 'good'"
        />
        <img
          src="../assets/ic-cross.svg"
          alt="icon-bad"
          v-if="state === 'bad'"
        />
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tile-grade',
  data: () => ({}),
  props: {
    title: {
      type: String,
      required: true
    },
    state: {
      type: String,
      default: 'good'
    }
  }
}
</script>

<style lang="scss" scoped>
.tile-grade-container {
  width: 100%;

  .rectangle {
    height: 32px;
    border: 1px solid #c6f7e9;
    border-radius: 2px;
    background-color: #f0fcf9;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding: 0 12px 0 8px;
    align-items: center;

    span.title {
      height: 21px;
      color: #079a82;
      font-family: Graphik;
      font-size: 12px;
      font-weight: 500;
      line-height: 21px;
      letter-spacing: 0.5px;
    }

    span.icon {
      width: 16px;
      height: 16px;
    }

    &.error {
      border: 1px solid #facdcd;
      background-color: #ffeeee;
      span.title {
        color: #a61b1b;
      }
    }

    &.warn {
      border: 1px solid #facdcd;
      background-color: rgb(255, 244, 229);
      span.title {
        color: #da902e;
      }
    }
  }
}
</style>

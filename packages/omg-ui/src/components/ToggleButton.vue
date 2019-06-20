<template>
  <div class="toggle-button-container">
    <div class="switch" @click="toggleHandler">
      <div class="rectangle" :class="{ off: !toggleReceiver }">
        <div class="circle" :class="{ off: !toggleReceiver }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'toggle-button',
  props: {
    toggleHandler: {
      type: Function,
      required: true
    },
    toggleReceiver: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.toggle-button-container {
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

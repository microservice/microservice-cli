<template>
  <div class="event-selector-container">
    <label>
      Event *
      <select
        id="event"
        required
        v-model="event"
        @change="$emit('eventSelected', event)"
      >
        <option
          :key="`event-${evtName}`"
          :name="`${evtName}`"
          v-for="(event, evtName) of getMicroservice.actions[actionName].events"
          >{{ evtName }}</option
        >
      </select>
    </label>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'event-selector',
  props: {
    actionName: {
      type: String,
      default: '',
      required: true
    }
  },
  computed: {
    ...mapGetters(['getMicroservice'])
  }
}
</script>

<style lang="scss" scoped>
label {
  height: 27px;
  color: #1f2933;
  font-family: Graphik;
  font-size: 18px;
  font-weight: 500;
  line-height: 27px;

  select#event {
    margin-left: 32px;
    height: 40px;
    width: 420px;
    border: 1px solid #dfe0e8;
    border-radius: 2px;
    background-color: #fff;
    color: #1f2933;
    font-family: Graphik;
    font-size: 14px;
    line-height: 21px;
    padding-left: 12px;
  }
}
</style>

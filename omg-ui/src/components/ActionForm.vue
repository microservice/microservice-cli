<template>
  <div class="action-form-container">
    <form
      class="action"
      @keyup="processData"
    >
      <h2
        class="clickable"
        @click="open === actionName ? open = '' : open = actionName"
      >
        {{ actionName }}
      </h2>
      <div
        class="inputs"
        :class="{'open': open === actionName}"
        v-if="getMicroservice.actions[actionName].arguments"
      >
        <label
          :key="`arg-${argName}`"
          v-for="(arg, argName) of getMicroservice.actions[actionName].arguments"
        >
          {{ argName }} {{ arg.required ? '*' : '' }}
          <input
            :name="`arg-${argName}`"
            :required="arg.hasOwnProperty('required') && arg.required ? true : false"
          >
        </label>
      </div>
      <div
        v-else
        :class="{'open': open === actionName}"
        class="inputs"
      >
        <input
          type="hidden"
          name="type"
          value="event"
        >
        <label>
          Event *
          <select
            id="event"
            required
            v-model="event"
          >
            <option
              :key="`event-${evtName}`"
              :name="`${evtName}`"
              v-for="(event, evtName) of getMicroservice.actions[actionName].events"
            >{{ evtName }}</option>
          </select>
        </label>
        <div v-if="event && event.length > 0">
          <label
            :key="`arg-${argName}`"
            v-for="(arg, argName) of getMicroservice.actions[actionName].events[event].arguments"
          >
            {{ argName }} {{ arg.required ? '*' : '' }}
            <input
              :name="`arg-${argName}`"
              :required="arg.hasOwnProperty('required') && arg.required ? true : false"
            >
          </label>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'action-form',
  data: () => ({
    open: '',
    obj: {},
    event: ''
  }),
  props: {
    actionName: {
      type: String,
      default: '',
      required: true
    }
  },
  computed: mapGetters(['getMicroservice']),
  mounted () {},
  methods: {
    processData (data) {
      const key = data.srcElement.name.substr(4)
      const value = data.srcElement.value

      this.obj['action'] = this.actionName
      this.obj['args'] = {}
      this.obj.args[key] = value
      if (this.event && this.event.length > 0) {
        this.obj['subscribe'] = true
      }
      this.$emit('argsEdited', this.obj)
    }
  }
}
</script>

<style lang="scss" scoped>
.action {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-evenly;
  align-items: center;

  .inputs {
    display: none;
  }

  .inputs.open {
    display: flex;
    flex-flow: column;
  }
}
</style>

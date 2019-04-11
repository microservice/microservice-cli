<template>
  <div class="documentation-container">
    <div class="actions-wrapper">
      <div
        class="action"
        :key="`action-${actionName}`"
        v-for="(action, actionName) of getMicroservice.actions"
      >
        <h2>{{ actionName }}</h2>
        <h3>{{ action.help }}</h3>
        <div class="args-wrapper">
          <div
            class="arg"
            :key="`arg-${argName}`"
            v-for="(argument, argName) of getMicroservice.actions[actionName]
              .arguments"
          >
            <h4>{{ argName }}</h4>
            <div class="arg-doc">
              <div class="type">Type: {{ argument.type }}</div>
              <div class="in">In: {{ argument.in }}</div>
              <div class="required">Required: {{ argument.required }}</div>
              <div class="help">Help: {{ argument.help }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'documentation',
  computed: { ...mapGetters(['getMicroservice']) },
  mounted() {
    console.log(this.getMicroservice)
  }
}
</script>

<style lang="scss" scoped>
.documentation-container {
  width: 100%;
  height: 100%;
  overflow: auto;

  .actions-wrapper {
    height: 100%;

    .action {
      h2:first-child {
        margin-top: 0;
      }

      .args-wrapper {
        .arg-doc {
          display: flex;
          flex-direction: column;
        }
      }
    }
  }
}
</style>

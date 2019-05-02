<template>
  <div class="forward-container">
    <div class="forward-wrapper">
      <div class="off" v-if="!getMicroservice || !getMicroservice.forward">
        <div class="title">
          Forward
        </div>
        <div class="desc">
          There are not forward attributes on this microservice.
        </div>
      </div>
      <div class="on" v-else>
        <div class="title">
          Forward
        </div>
        <div
          class="values"
          v-for="(value, valueName) of getMicroservice.forward"
          :key="`value-${valueName}`"
        >
          <div class="value-name">{{ valueName }}</div>
          <div class="value-params">
            <div
              class="param"
              v-for="(param, paramName) of value.http"
              :key="`param-${paramName}`"
            >
              {{ paramName }}: {{ param }}
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
  name: 'forward',
  computed: {
    ...mapGetters(['getMicroservice'])
  }
}
</script>

<style lang="scss" scoped>
.forward-container {
  height: 100%;
  margin: 24px 0 0 24px;
  text-align: left;

  .title {
    height: 27px;
    color: #1f2933;
    font-family: Graphik;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
  }

  .desc {
    margin-top: 8px;
    height: 51px;
    color: #616e7c;
    font-family: Graphik;
    font-size: 14px;
    line-height: 22px;
  }

  .values {
    margin-top: 24px;
    color: #616e7c;
    font-family: Graphik;
    font-size: 14px;
    line-height: 22px;

    .value-params {
      color: #616e7c;
      font-family: Graphik;
      font-size: 14px;
      line-height: 22px;
      margin-left: 8px;
      margin-top: 8px;
    }
  }
}
</style>

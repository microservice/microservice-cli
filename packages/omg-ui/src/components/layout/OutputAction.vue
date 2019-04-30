<template>
  <div class="output-container">
    <div class="title">Output</div>
    <div class="logs-output">
      <pre><code>{{ getActionOutput }}</code></pre>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'output-action',
  computed: {
    ...mapGetters(['getActionOutput'])
  }
}
</script>

<style lang="scss" scoped>
.output-container {
  height: calc(100vh - 93px);
  width: 900px;
  background-color: #1f2933;
  padding: 24px 10px 0 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: auto;

  .title {
    height: 27px;
    color: #ffffff;
    font-family: Graphik;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    margin-bottom: 22px;
  }

  .logs-output {
    height: 100%;
    color: #ffffff;
    font-family: SF Mono;
    font-size: 13px;
    line-height: 20px;

    pre {
      display: flex;

      code {
        text-align: left;
      }
    }
  }
}
</style>

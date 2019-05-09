<template>
  <div class="container-metrics-container">
    <!-- <div class="heading">Container Metrics</div> -->
    <div class="metrics">
      <div class="cpu metrics-item">
        <div class="header">
          <div class="title">CPU</div>
          <div class="value">
            {{ cpuPercentage !== NaN ? cpuPercentage.toFixed(2) : 0 }} %
          </div>
        </div>
        <div class="graph">
          <graph :values="cpuArr" />
        </div>
      </div>
      <div class="ram metrics-item" @click="memModePercent = !memModePercent">
        <div class="header">
          <div class="title">Memory</div>
          <div class="value" v-if="memModePercent">
            {{ memPercentage !== NaN ? memPercentage.toFixed(2) : 0 }} %
          </div>
          <div
            class="value"
            v-if="
              !memModePercent &&
                memRawValue !== NaN &&
                (memRawValue.mem && memRawValue.limit)
            "
          >
            {{ memRawValue.mem.toFixed(2) }}
            /
            {{ memRawValue.limit.toFixed(2) }}
            MB
          </div>
        </div>
        <div class="graph">
          <graph :values="memArr" />
        </div>
      </div>
      <div class="io metrics-item">
        <div class="header">
          <div class="title">Disk</div>
          <div
            class="value"
            v-if="ioRawValue !== NaN && (ioRawValue.read && ioRawValue.write)"
          >
            {{ ioRawValue.read }} | {{ ioRawValue.write }}
          </div>
        </div>
        <div class="graph">
          <graph :values="diskArr" :biDataMode="true" />
        </div>
      </div>
      <div class="network metrics-item">
        <div class="header">
          <div class="title">Network</div>
          <div class="value" v-if="networkRawValue !== NaN">
            <arrow-forward class="rx" />
            {{
              networkRawValue.rx > 0 ? networkRawValue.rx.toFixed(2) : "0.00"
            }}
            /
            {{
              networkRawValue.tx > 0 ? networkRawValue.tx.toFixed(2) : "0.00"
            }}
            KB/s
            <arrow-forward class="tx" />
          </div>
        </div>
        <div class="graph">
          <graph :values="netArr" :biDataMode="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ArrowForward from '@/components/ArrowForward'
import Graph from '@/components/Graph'

export default {
  name: 'container-metrics',
  components: {
    ArrowForward,
    Graph
  },
  data: () => ({
    memModePercent: false,
    cpuArr: [],
    memArr: [],
    diskArr: [],
    netArr: []
  }),
  computed: {
    ...mapGetters(['getDockerStats', 'getSocket']),
    cpuPercentage: function () {
      const stats = this.getDockerStats
      if (stats && stats.length > 2) {
        const previousCPU = stats[stats.length - 2].cpu_stats.cpu_usage.total_usage
        const previousSystem = stats[stats.length - 2].cpu_stats.system_cpu_usage
        return this.calculateCPUPercentUnix(previousCPU, previousSystem, stats[stats.length - 1])
      }
      return NaN
    },
    memPercentage: function () {
      const stats = this.getDockerStats
      if (stats && stats.length > 0) {
        return parseFloat(stats[stats.length - 1].memory_stats.usage) / parseFloat(stats[stats.length - 1].memory_stats.limit) * 100.0
      }
      return NaN
    },
    memRawValue: function () {
      const stats = this.getDockerStats
      if (stats && stats.length > 0) {
        return {
          mem: parseFloat(stats[stats.length - 1].memory_stats.usage) / 1024 / 1024,
          limit: parseFloat(stats[stats.length - 1].memory_stats.limit) / 1024 / 1024
        }
      }
      return NaN
    },
    ioRawValue: function () {
      const stats = this.getDockerStats
      if (stats && stats.length > 0) {
        return this.calculateBlockIO(stats[stats.length - 1].blkio_stats)
      }
      return NaN
    },
    networkRawValue: function () {
      const stats = this.getDockerStats
      if (stats && stats.length > 2) {
        const previous = stats[stats.length - 2].networks
        const net = this.calculateNetwork(previous, stats[stats.length - 1].networks)
        net.rx /= 1024
        net.tx /= 1024
        return net
      }
      return NaN
    }
  },
  watch: {
    getDockerStats: function () {
      const stats = this.getDockerStats
      if (stats && stats.length > 0) {
        this.memArr.push(parseFloat(stats[stats.length - 1].memory_stats.usage) / 1024 / 1024)
        this.diskArr.push({
          up: this.calculateBlockIO(stats[stats.length - 1].blkio_stats).read,
          down: this.calculateBlockIO(stats[stats.length - 1].blkio_stats).write
        })
      }
      if (stats && stats.length > 2) {
        const previousCPU = stats[stats.length - 2].cpu_stats.cpu_usage.total_usage
        const previousSystem = stats[stats.length - 2].cpu_stats.system_cpu_usage
        const previousNet = stats[stats.length - 2].networks
        const net = this.calculateNetwork(previousNet, stats[stats.length - 1].networks)

        this.cpuArr.push(this.calculateCPUPercentUnix(previousCPU, previousSystem, stats[stats.length - 1]))
        net.rx /= 1024
        net.tx /= 1024
        this.netArr.push({
          down: net.rx,
          up: net.tx
        })
      }
    }
  },
  mounted () {
    this.getSocket.on('container-stats', res => {
      this.addDockerStatsEntry(res.log)
    })
  },
  beforeDestroy () {
    this.getSocket.removeListener('container-stats')
  },
  methods: {
    ...mapMutations(['addDockerStatsEntry']),
    // https://github.com/moby/moby/blob/eb131c5383db8cac633919f82abad86c99bffbe5/cli/command/container/stats_helpers.go#L175-L188
    calculateCPUPercentUnix (previousCPU, previousSystem, v) {
      let cpuPercent = 0.0
      const cpuDelta = parseFloat(v.cpu_stats.cpu_usage.total_usage) - parseFloat(previousCPU)
      const systemDelta = parseFloat(v.cpu_stats.system_cpu_usage) - parseFloat(previousSystem)

      if (systemDelta > 0.0 && cpuDelta > 0.0) {
        cpuPercent = (cpuDelta / systemDelta) * parseFloat(v.cpu_stats.cpu_usage.percpu_usage.length) * 100.0
      }
      return cpuPercent
    },
    calculateBlockIO (blkio) {
      if (blkio.length > 0) {
        for (const entry of blkio.io_service_bytes_recursive) {
          return {
            read: entry.value,
            write: entry.write
          }
        }
      }
      return NaN
    },
    calculateNetwork (previous, networks) {
      let rx = 0
      let tx = 0
      let prevRx = 0
      let prevTx = 0

      for (const iface in networks) {
        rx += networks[iface].rx_bytes
        tx += networks[iface].tx_bytes
      }
      for (const iface in previous) {
        prevRx += previous[iface].rx_bytes
        prevTx += previous[iface].tx_bytes
      }
      return { rx: rx - prevRx, tx: tx - prevTx }
    }
  }
}
</script>

<style lang="scss" scoped>
.container-metrics-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .heading {
    height: 21px;
    color: #7b8794;
    font-family: Graphik;
    font-size: 16px;
    line-height: 21px;
    margin-left: 32px;
    margin-top: 32px;
  }

  .metrics {
    margin: 24px;
    // margin: 24px 24px 32px 24px;

    .metrics-item {
      height: 52px;
      display: flex;
      flex-direction: column;

      &:not(:last-child) {
        margin-bottom: 16px;
      }

      .header {
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
        margin: 0 8px;
        align-items: center;

        .title {
          height: 21px;
          color: #151734;
          font-family: Graphik;
          font-size: 14px;
          line-height: 21px;
        }

        .value {
          height: 21px;
          color: #151734;
          font-family: Graphik;
          font-size: 14px;
          font-weight: 500;
          line-height: 21px;
          text-align: right;
        }
      }

      &.network {
        .header {
          .value {
            display: flex;

            .rx {
              transform: rotate(90deg);
            }

            .tx {
              transform: rotate(-90deg);
            }
          }
        }
      }
    }
  }
}
</style>

<template>
  <div class="layout-container">
    <top-bar />
    <div class="left-bar">
      <div class="validations-container">
        <div class="microservice-wrapper">
          <span class="title title-padding">
            Setup
          </span>
          <!-- <div @click="$router.push({ path: '/editor' })" class="tile-wrapper">
            <tile-grade
              :title="'microservice.yml'"
              :clickable="true"
              :state="getMicroserviceStatus ? 'good' : 'bad'"
            /> -->
          <tile-grade
            :title="'microservice.yml'"
            :state="getMicroserviceStatus ? 'good' : 'bad'"
          />
          <!-- </div> -->
        </div>
        <div class="dcontainer-wrapper">
          <div class="tiles">
            <tile-grade
              class="tile"
              :title="
                getDockerState === 'stopped'
                  ? 'Stopped'
                  : getDockerState === 'building'
                  ? 'Building'
                  : getDockerState === 'starting'
                  ? 'Starting'
                  : getDockerState === 'started'
                  ? 'Started'
                  : 'Container NOK'
              "
              :state="
                getDockerState === 'stopped'
                  ? 'bad'
                  : getDockerState === 'building' ||
                    getDockerState === 'starting'
                  ? 'warn'
                  : getDockerState === 'started'
                  ? 'good'
                  : 'bad'
              "
            />
            <!-- <tile-grade class="tile" :title="'Validations'" :state="'bad'" /> -->
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <navigation class="nav" />
      <div class="divider"></div>
      <container-metrics />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Navigation from '@/components/layout/navigation/Navigation'
import TopBar from '@/components/layout/TopBar'
import TileGrade from '@/components/TileGrade'
import ContainerMetrics from '@/components/layout/ContainerMetrics'

export default {
  name: 'layout',
  components: {
    Navigation,
    TopBar,
    TileGrade,
    ContainerMetrics
  },
  computed: {
    ...mapGetters(['getMicroserviceStatus', 'getDockerState'])
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  width: 300px;
  min-width: 300px;

  .left-bar {
    display: flex;
    flex-flow: column nowrap;
    height: calc(100vh - 69px);
    width: 100%;

    .nav {
      flex: 1;
    }

    .validations-container {
      margin: 0 24px;

      .microservice-wrapper {
        .tile-wrapper {
          width: 100%;
        }
      }

      .microservice-wrapper,
      .dcontainer-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .title {
          height: 21px;
          color: #565872;
          font-family: "Graphik";
          font-size: 14px;
          font-weight: 500;
          line-height: 21px;
        }

        .title-padding {
          padding-left: 2px;
          margin-bottom: 8px;
        }

        .tiles {
          display: flex;
          justify-content: space-between;
          width: 100%;

          .tile {
            width: 48.5%;
          }
        }
      }
      .microservice-wrapper {
        margin-top: 13px;
        margin-bottom: 16px;
      }
      .dcontainer-wrapper {
        margin-bottom: 24px;
      }
    }

    .divider {
      box-sizing: border-box;
      width: 100%;
      border-bottom: 1px solid #f2f3f9;
    }
  }
}
</style>

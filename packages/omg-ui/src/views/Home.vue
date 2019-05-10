<template>
  <div class="home-container">
    <div class="row">
      <!-- <div class="i-tiles info">
        <arrow-forward class="arrow-wrapper" />
        <div class="wrapper">
          <div class="title">Tiles</div>
          <div class="desc">
            Displays current state of the different components of your app
            (validation, container, ...)
          </div>
        </div>
      </div>
      <div class="i-topbar info">
        <arrow-forward class="arrow-wrapper" />
        <div class="wrapper">
          <div class="title">Topbar</div>
          <div class="desc">
            Shows information about the current action, such as : Name,
            Protocol, Method, Path, ...
          </div>
        </div>
      </div> -->
    </div>
    <!-- <div class="row">
      <div class="i-menu info">
        <arrow-forward class="arrow-wrapper" />
        <div class="wrapper">
          <div class="title">Menu</div>
          <div class="desc">
            Menu to navigate to actions, environment variables and more. You
            should start by setting your environment variables.
          </div>
        </div>
      </div>
      <div class="i-output info">
        <arrow-forward class="arrow-wrapper" />
        <div class="wrapper">
          <div class="title">Output</div>
          <div class="desc">
            Here's where your actions' outputs will show up.
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="i-logs info">
        <arrow-forward class="arrow-wrapper" />
        <div class="wrapper">
          <div class="title">Logs</div>
          <div class="desc">
            Here are all the logs about your microservice : docker logs and your
            container logs.
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
// import ArrowForward from '@/components/ArrowForward'

export default {
  name: 'home',
  components: {
    // ArrowForward
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100px;

    .info {
      width: 300px;

      .wrapper {
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
          color: #616e7c;
          font-family: Graphik;
          font-size: 14px;
          line-height: 22px;
        }
      }

      &.i-tiles,
      &.i-menu {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .arrow-wrapper {
          transform: rotate(180deg);
        }
      }

      &.i-topbar {
        .arrow-wrapper {
          transform: rotate(-90deg);
        }
      }

      &.i-output {
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        align-items: center;
      }
      &.i-logs {
        display: flex;
        flex-direction: column-reverse;

        .arrow-wrapper {
          transform: rotate(90deg);
        }
      }
    }
  }
}
</style>

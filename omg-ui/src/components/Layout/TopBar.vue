<template>
  <div class="topbar-container">
    <div class="topbar-left">
      <img
        src="https://avatars2.githubusercontent.com/u/39149433?s=200&v=4"
        alt="OMG app logo"
        class="logo"
      />
    </div>
    <div class="topbar-right">
      <div class="title-container">
        <h1 class="title">{{ $route.name }}</h1>
      </div>
      <div class="search-container">
        <input placeholder="SEARCH DOCS" name="search" class="search-input" />
        <svg
          enable-background="new 0 0 32 32"
          id="magnifying-glass"
          version="1.1"
          viewBox="0 0 32 32"
          xml:space="preserve"
          height="12px"
          width="12px"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <circle
            cx="14"
            cy="14"
            fill="none"
            id="XMLID_42_"
            r="9"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            stroke-width="2"
          />
          <line
            fill="none"
            id="XMLID_44_"
            stroke="#000000"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-miterlimit="10"
            stroke-width="2"
            x1="27"
            x2="20.366"
            y1="27"
            y2="20.366"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'topbar'
}
</script>

<style lang="scss" scoped>
.topbar-container {
  width: 100vw;
  display: flex;
  height: 88px;

  .topbar-left {
    width: 300px;
    min-width: 300px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    img {
      width: 45px;
      border-radius: 9.5px;
      background-color: #150d44;
    }
  }

  .topbar-right {
    width: 100%;
    border-bottom: 1px solid lightslategray;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-container {
      margin-left: 121px;

      .title {
        margin: 0;
        height: 30px;
        color: #151734;
        font-family: GilroyBold;
        font-size: 20px;
        letter-spacing: 1px;
        line-height: 30px;
        text-transform: uppercase;
      }
    }

    .search-container {
      height: 40px;
      width: 400px;
      border-radius: 5px;
      background-color: #f2f3f9;
      margin: 24px 55px 24px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;

      .search-input {
        background: transparent;
        border: none;
        box-shadow: none;
        height: 26px;
        width: 116px;
        color: #7b7b8f;
        font-family: GilroySemiBold;
        font-size: 12px;
        letter-spacing: 0.38px;
        line-height: 28px;
      }
    }
  }
}
</style>

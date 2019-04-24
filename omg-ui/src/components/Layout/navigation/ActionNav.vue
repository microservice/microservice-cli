<template>
  <div class="action-nav-container">
    <div class="actions">
    <form class="search-container" @submit.prevent="search">
      <input type="text" class="search" placeholder="Search" name="search">
      <button type="submit">
        <img src="../../../assets/ic-search.svg" alt="magnifyer icon" class="magnifyer">
      </button>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'action-nav',
  data: () => ({
  }),
  computed: {
    ...mapGetters(['getMicroservice'])
  },
  methods: {
    search(data) {
      if (Object.keys(this.getMicroservice.actions).includes(data.srcElement[0].value)) {
        this.$router.push({name: 'actions', params: {
          action: data.srcElement[0].value
        }})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  width: 228px;
  height: 40px;
  border-radius: 2px;
  border: solid 1px #e4e7eb;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;

  input.search,
  input.search::placeholder {
    width: 207px;
    height: 26px;
    font-family: Graphik;
    font-size: 14px;
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: 1px;
    color: #9aa5b1;
    background: transparent;
    box-shadow: none;
    border: none;
  }

  input.search:focus {
    outline: none;
  }

  input.search::placeholder {
    text-transform: uppercase;
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;

    img.magnifyer {
      width: 16px;
      height: 16px;
    }
  }
}
</style>

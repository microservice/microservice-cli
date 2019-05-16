<template>
  <div class="action-nav-container">
    <div class="actions">
      <form class="search-container" @submit.prevent="search">
        <!-- Try naming the input 'omg-search' to avoid Chrome to autocomplete with random stuff -->
        <input
          type="text"
          class="search"
          placeholder="Search"
          name="omg-search"
          v-model="search"
        />
        <button type="submit">
          <img
            src="../../../assets/ic-search.svg"
            alt="magnifyer icon"
            class="magnifyer"
          />
        </button>
      </form>
      <div class="action-list">
        <div
          class="action"
          :key="action"
          v-for="action of filteredActions"
          @click="
            $router.push({ name: 'actions', params: { action: action } });
            search = '';
          "
        >
          {{ action }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'action-nav',
  data: () => ({
    search: ''
  }),
  computed: {
    ...mapGetters(['getMicroservice', 'getMicroserviceActionList']),
    filteredActions: function () {
      if (this.getMicroserviceActionList) {
        return this.getMicroserviceActionList.filter(action => {
          return action.toLowerCase().includes(this.search.toLowerCase())
        })
      }
      return null
    }
  },
  mounted () {
  },
  methods: {
    search (data) {
      if (Object.keys(this.getMicroservice.actions).includes(data.srcElement[0].value)) {
        this.$router.push({ name: 'actions',
          params: {
            action: data.srcElement[0].value
          } })
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

.action-list {
  max-height: 170px;
  overflow: auto;
  margin-top: 12px;
  margin-bottom: 12px;

  .action {
    height: 21px;
    color: #616e7c;
    font-family: Graphik;
    font-size: 16px;
    line-height: 21px;
    cursor: pointer;
    margin-left: 8px;

    &:hover {
      text-decoration: underline;
      border-radius: 2px;
    }

    &:not(:first-child) {
      margin-top: 12px;
    }
  }
}
</style>

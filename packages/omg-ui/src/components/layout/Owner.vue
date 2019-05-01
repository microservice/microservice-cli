<template>
  <div class="owner-container">
    <img src="../../assets/ic-git.svg" alt="Github logo" class="gh-logo" />
    <a class="owner-name" :href="`https://github.com/${getOwner}`">{{
      getOwner
    }}</a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'owner',
  data: () => ({
    url: ''
  }),
  computed: mapGetters(['getOwner']),
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.owner-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .gh-logo {
    margin-right: 8px;
    width: 17px;
    height: 17px;
  }

  a {
    height: 21px;
    color: #565872;
    font-family: Graphik;
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

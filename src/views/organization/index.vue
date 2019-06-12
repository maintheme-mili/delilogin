<template>
  <div class="organization">
    <div class="org">
      <TheNavbar></TheNavbar>
        <p class="org-choose">请选择</p>
    </div>

  </div>
</template>

<script>
import TheNavbar from './Navbar'
export default {
  components: {
    TheNavbar
  }

}
</script>

<style lang="scss">
  .organization {
    height: 100%;
    overflow: hidden;
    background-image: url(~@/assets/login-bg.png);
    background-repeat: no-repeat;
    background-size: cover;
  }
  .org {
    height: 100%;
    overflow: auto;
    position: relative;

    &-choose {
      font-size: 30px;
      color: #fff;
      font-weight: bold;
    }
  }
</style>

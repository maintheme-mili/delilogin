<template>
  <div class="navbar">
    <div class="nav">
      <div class="nav-left">
        <img class="nav-logo" src="~@/assets/logo.png">
        <img class="nav-text" src="~@/assets/logo-text.png">
        <div class="nav-content">管理后台</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
  .nav {
    width: 1200px;
    margin: 0 auto;
    padding: 30px 0;

    &-left {
      display: inline-block;
    }

    &-logo {
      width: 50px;
      height: 50px;
      margin-right: 12px;
    }
    &-text {
      width: 84px;
      height: 21px;
      margin-right: 4px;
    }
    &-content {
      font-size: 18px;
      color: #000;
      font-weight: 700;
      display: inline-block;
    }

    &-logo,
    &-text,
    &-content{
      vertical-align: middle;
    }
  }
</style>

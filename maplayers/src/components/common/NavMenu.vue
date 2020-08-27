<template>
  <el-menu
    :default-active="'/index'"
    router
    mode="horizontal"
    background-color="#3c8dbc"
    text-color="#fff"
    active-text-color="#222"
    style="min-width: 1300px">
    <el-menu-item>
      <img src="../../assets/gk_log.png"/>
    </el-menu-item>
    <el-menu-item v-for="(item,i) in navList" :key="i" :index="item.name" style="font-size: 16px">
      {{ item.navItem }}
    </el-menu-item>
    <a href="#nowhere" style="color: #fff;float: right;padding: 20px;">更多功能</a>
    <i class="el-icon-menu" style="float:right;font-size: 45px;color: #fff;padding-top: 8px"></i>
    <span style="position: absolute;padding-top: 20px;right: 43%;font-size: 20px;font-weight: bold"></span>
  </el-menu>
</template>

<script>
export default {
  name: 'NavMenu',
  data () {
    return {
      navList: [
        {name: '/index', navItem: '首页'},
        {name: '/footer', navItem: '高级产品'},
        {name: '/library', navItem: '兆格一号'},
        {name: '/admin', navItem: '个人中心'}
      ]
    }
  }
}
</script>

<style scoped>

</style>

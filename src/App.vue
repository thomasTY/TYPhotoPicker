<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import eruda from 'eruda'

export default {
  name: 'app',
  created: function () {
    // 日志查看
    var el = document.createElement('div')
    document.body.appendChild(el)
    eruda.init({
      container: el,
      tool: ['console', 'elements']
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

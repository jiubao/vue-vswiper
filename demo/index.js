var vswiper = window['vue-vswiper']

Vue.use(vswiper)

new Vue({
  el: '#app',
  data () {
    return {
      name: 'aaa'
    }
  },
  template: `<div>
    <input type="text" />
    <span>{{name}}</span>
    <vswiper></vswiper>
    </div>`,
})

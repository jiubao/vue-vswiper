var vswiper = window['vue-vswiper']

Vue.use(vswiper)

new Vue({
  el: '#app',
  data () {
    return {
      name: 'aaa',
      imgs: [
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522593042907&di=74bb253b48d581d5f70cb87b25f3a2ae&imgtype=0&src=http%3A%2F%2Fimg0.pconline.com.cn%2Fpconline%2F1707%2F13%2F9564666_c569d125519f4ea_thumb.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1523187876&di=1022f9e702e2944190cb5bb11936bef0&imgtype=jpg&er=1&src=http%3A%2F%2Fimage13.m1905.cn%2Fuploadfile%2F2017%2F0719%2F20170719090116823019.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522593200919&di=badbcce5443c8aff40d89a9d4acdeecc&imgtype=0&src=http%3A%2F%2Fimage13.m1905.cn%2Fuploadfile%2F2017%2F1110%2F20171110083939160933_watermark.jpg',
        'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522593270443&di=b531b016507e18a08e74d1af12000514&imgtype=0&src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2Ff%2F5975b00d06a3b.jpg'
      ]
    }
  },
  template: `<div>
      <vswiper indicator cycle vertical>
        <vswiper-item v-for="(img, index) in imgs" :key="index" :thumbnail="imgs[index]">
          <img :src="img" />
        </vswiper-item>
      </vswiper>
    </div>`,
})

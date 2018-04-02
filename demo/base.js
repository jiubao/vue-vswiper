var vswiper = window['vue-vswiper']

Vue.use(vswiper)

new Vue({
  el: '#app',
  data () {
    return {
      name: 'aaa',
      imgs: [
        'https://imgdatabase.yingheying.com/c4accadc72394900af95c68908d974dc.png?x-oss-process=image/resize,m_lfit,w_1242,h_1242',
        'https://imgdatabase.yingheying.com/99bfb19ae5b3435cb94247743f5a58aa.png?x-oss-process=image/resize,m_lfit,w_1242,h_1242',
        'https://imgdatabasetest.yingheying.com/d7deb924046542bfabba625179d70baa.jpeg?x-oss-process=image/resize,m_lfit,w_1242,h_1242'
      ]
    }
  },
  template: `<div>
      <vswiper cycle>
        <vswiper-item v-for="(img, index) in imgs" :key="index" :thumbnail="imgs[index]">
          <img :src="img" />
        </vswiper-item>
      </vswiper>
    </div>`,
})

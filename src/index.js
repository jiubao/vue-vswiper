import swiper from './swiper.vue'
import swiperItem from './swiper-item.vue'

export default {
  install (vue, options) {
    vue.component('vswiper', swiper)
    vue.component('vswiper-item', swiperItem)
  }
}

import swiper from './swiper'

export default {
  install (vue, options) {
    vue.component('vswiper', swiper)
  }
}

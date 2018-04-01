<template lang="html">
  <div class="swiper" :class="{expose: _expose}">
    <div class="thumbnail" v-if="thumbnails && thumbnails.length > 0">
      <img :src="src" v-for="src in thumbnails">
    </div>
    <div class="swiper-items" ref="items">
      <slot></slot>
    </div>
    <div class="swiper-indicators" v-if="_indicator" v-show="slides && slides.length > 1">
      <span>{{index + 1}}</span>/<span>{{slides.length}}</span>
    </div>
  </div>
</template>

<script>
// thumbnails: tell swiper all imgs' small version
// thumbnail: tell swiper img size
//
// <swiper :thumbnails="thumbnails">
//   <swiper-item v-for="(img, index) in imgs" :key="index" :thumbnail="thumbnails[index]">
//     <zimg :src="img"></zimg>
//   </swiper-item>
// </swiper>

import { addClass, removeClass, on, once, requestFrame, isUndefined } from './utils'

// var d1 = Date.now()
//
// function logd (s) {
//   var d2 = Date.now()
//   console.log(s, d2 - d1)
//   d1 = d2
// }

export default {
  name: 'swiper',
  props: {
    thumbnails: Array,
    indicator: {
      type: String
    },
    cycle: {
      type: String
    },
    vertical: {
      type: String
    },
    // don't use expose together with vertical
    expose: {
      type: String
    },
    stop: {
      type: String
    },
    mode: {
      type: String,
      default: ''
    },
    boxid: {
      type: String
    }
  },
  data () {
    return {
      disable: false,
      slides: [],
      state: {
        currentLeft: 0,
        startLeft: 0,
        startTime: 0,
        width: 0
      },
      index: 0,
      scrolling: 0, // 0: freeze, 1: h, 2: v
      status: 0, // 0000 _, animatingY, animatingX, scrolling,
      box: null
    }
  },
  computed: {
    // ticking () { return this.status & 1 },
    _indicator () { return !isUndefined(this.indicator) },
    _cycle () { return !isUndefined(this.cycle) },
    _vertical () { return !isUndefined(this.vertical) },
    _expose () { return !isUndefined(this.expose) },
    _stop () { return !isUndefined(this.stop) },
    animatingX () { return this.status & 2 },
    animatingY () { return this.status & 4 },
    len () { return this.slides ? this.slides.length : 0 },
    _width () { return this.$el.offsetWidth },
    prev () {
      return this.len > 1 && this.index === 0 && this._cycle ? this.slides[this.len - 1] : this.slides[this.index - 1]
    },
    current () {
      return this.slides[this.index]
    },
    next () {
      return this.len > 1 && this.index === this.len - 1 && this._cycle ? this.slides[0] : this.slides[this.index + 1]
    },
    gap () {
      var left = this.state.currentLeft - this.state.startLeft
      var width = this.state.width

      return Math.min(Math.max(-width, left), width)
    },
    right () { return this.gap > 0 },
    target () { return this.right ? this.prev : this.next },
    back () { return this.right ? this.next : this.prev },
    first () { return this.len > 0 ? this.slides[0] : null },
    last () { return this.len > 0 ? this.slides[this.len - 1] : null }
  },
  methods: {
    // isUndefined (val) { return isUndefined(val) },
    moveAllExceptCurrent () {
      var next = this.next
      var i = 1
      while (next) {
        this.moveX(next, this._width * i)
        next = next.next
        i++
      }

      var prev = this.prev
      i = -1
      while (prev) {
        this.moveX(prev, this._width * i)
        prev = prev.prev
        i--
      }
    },
    init () {
      if (this._expose && this.boxid) {
        this.box = document.getElementById(this.boxid)
      }
      var children = this.$children
      this.disable = children.length < 2
      this.index = 0
      // var width = this.$el.offsetWidth
      // debugger
      var width = this._width
      children.forEach((c, i) => {
        var owidth = c.width || width
        var oheight = c.height || width
        var slide = {
          el: c.$el,
          width: width,
          height: width * oheight / owidth
        }

        if (this.len > 0) this.slides[this.len - 1].next = slide

        slide.prev = this.last

        this.slides.push(slide)
        i === 0 ? addClass(c.$el, 'active') : removeClass(c.$el, 'active')

        if (!c.thumbnail) return

        var img = new Image()
        img.onload = () => {
          slide.height = width * img.naturalHeight / img.naturalWidth
          if (i === 0 && !this.animatingX && !this.animatingY) this.animateY(this.current)
        }
        img.src = c.thumbnail
      })

      if (this._cycle && this.len > 0) {
        this.first.prev = this.last
        this.last.next = this.first
      }

      var element = this.$el
      if (!this._expose) this.moveX(this.next, width)
      else this.moveAllExceptCurrent()

      on(element, 'touchstart', (e) => {
        this.onTouchStart(e)
      })

      on(element, 'touchmove', (e) => {
        if (this.scrolling === 2) return
        this.onTouchMove(e)
        // setTimeout(() => this.onTouchMove(e), 17)
        // window.requestAnimationFrame(() => this.onTouchMove(e))
        // e.preventDefault()
        // requestFrame(() => {
        //   this.onTouchMove(e)
        // }, true)
      })

      on(element, 'touchend', (e) => {
        if (this.scrolling === 2) return
        this.onTouchEnd(e)
        // setTimeout(() => this.onTouchEnd(e), 17)
        // window.requestAnimationFrame(() => this.onTouchEnd(e))
        // requestFrame(() => {
        //   requestFrame(() => this.onTouchEnd(e))
        // })
      })
    },

    moveX (slide, offset) {
      slide && this._moveX(slide.el, offset)
    },

    _moveX (el, offset) {
      el.style.webkitTransition = ''
      el.style.webkitTransform = `translate3d(${offset}px, 0, 0)`
    },

    moveY (from, to, offsetX) {
      if (!from || !to) return
      var fh = from.height
      var th = to.height
      if (fh === th) return

      var h = fh - (fh - th) * offsetX / this.state.width
      if ((fh > th && h < to) || (fh < th) && h > to) h = th

      this.$refs.items.style.height = h + 'px'
    },

    setImg (slide) {
      if (!slide) return
      var height = this.$refs.items.offsetHeight
      if (height === slide.height) return

      removeClass(slide.el, height > slide.height ? 'mode1' : 'mode2')
      addClass(slide.el, height > slide.height ? 'mode2' : 'mode1')
    },

    _animateX (el, offset) {
      this.animate(2, el, function () {
        el.style.webkitTransition = '-webkit-transform 100ms ease-in-out'
      }, function () {
        el.style.webkitTransform = `translate3d(${offset}px, 0, 0)`
      })
    },

    animateX (slide, offset) {
      slide && this._animateX(slide.el, offset)
    },

    animateY (to) {
      if (!to) return
      var element = this.$refs.items
      this.animate(4, element, function () {
        element.style.webkitTransition = 'height 100ms ease-in-out'
      }, function () {
        element.style.height = to.height + 'px'
      }, () => this.$emit('swipeend'))
    },

    animate (direction, element, transition, transitionFn, fn) {
      // animatingX/Y: true
      this.status = this.status | direction
      transition()
      requestFrame(transitionFn)
      var called = false
      var callback = () => {
        if (called) return
        called = true
        // animatingX/Y: false
        this.status = this.status & ~direction
        element.style.webkitTransition = ''
        fn && fn()
      }
      once(element, 'webkitTransitionEnd', callback)
      setTimeout(callback, 120)
    },

    onTouchStart (event) {
      // debugger
      if (this.disable) return
      if (this.animatingX || this.animatingY) return
      this.scrolling = 0

      // var element = this.$el
      var state = this.state
      var touch = event.touches[0]

      state.startTime = Date.now()
      state.startLeft = touch.pageX
      state.currentLeft = touch.pageX
      state.startTop = touch.clientY

      // var width = state.width = element.offsetWidth
      // var width = state.width = this._width
      state.width = this._width

      // this.moveX(this.prev, -this._width)
      // this.moveX(this.next, this._width)
    },

    onTouchMove (event) {
      if (this.disable) return

      if (this.animatingX || this.animatingY) {
        event.preventDefault()
        return
      }

      var state = this.state
      var touch = event.touches[0]

      state.currentLeft = touch.pageX

      var width = this.state.width
      var left = this.gap
      var right = this.right
      var target = this.target

      if (this.scrolling === 0) {
        var x = Math.abs(left)
        var y = Math.abs(touch.clientY - state.startTop)
        if (x * 2 < y) {
          this.scrolling = 2
          return
        } else {
          this.scrolling = 1
        }
      }

      event.preventDefault()

      // 1.

      // if (!this._cycle || this.slides.length > 2) {
      //   this.moveX(this.back, right ? left + width : left - width)
      //   target && this.moveX(target[right ? 'prev' : 'next'], right ? left - width - width : left + width + width)
      // }

      if (this._expose) {
        // this.moveAll(left - width * this.index)
        this._moveX(this.$refs.items, left - width * this.index)
      } else {
        this.moveX(this.back, -width)
        this.moveX(this.current, left)
        this.moveX(target, right ? left - width : left + width)
      }

      // don't set vertical if expose
      if (!this._vertical) return

      this.moveY(this.current, target, Math.abs(left))

      this.setImg(this.current)
      this.setImg(target)
    },

    shouldCancel () {
      var width = this.state.width
      var cancel = Math.abs(this.gap) < width / 4
      var endTime = Date.now()
      var duration = endTime - this.state.startTime

      return ((duration > 300 || duration < 16) && cancel) || (!this._cycle && this.right && this.current === this.first) || (!this._cycle && !this.right && this.current === this.last)
    },

    onTouchEnd (event) {
      if (this.disable) return
      if (this.animatingX || this.animatingY) return

      var state = this.state
      var left = this.gap

      if (left === 0) return

      var width = state.width
      var right = this.right
      var target = this.target
      var back = this.back

      if (this._stop) return

      // don't cacnel it if the duration is short enough
      // if (((duration > 300 || duration < 16) && cancel) || (!this._cycle && right && this.current === this.first) || (!this._cycle && !right && this.current === this.last)) {
      if (this._expose) {
        if (this.shouldCancel()) {
          this._animateX(this.$refs.items, -this.index * width)
          return
        }

        this._animateX(this.$refs.items, right ? (1 - this.index) * width : (-this.index - 1) * width)
      } else {
        if (this.shouldCancel()) {
          this.moveX(back, -width)
          this.animateX(this.current, 0)
          this.animateX(target, right ? -width : width)
          return
        }

        this.moveX(back, -width)
        this.animateX(this.current, right ? width : -width)
        this.animateX(target, 0)
      }

      this._vertical && this.animateY(target)

      // set index
      var i = this.index
      var len = this.slides.length
      if (right) i--
      else i++
      if (i < 0) i = len - 1
      if (i >= len) i = 0
      this.index = i
    }
  },

  mounted () {
    this.init()

    // todo: support window resize
    // on(window, 'resize', () => this.init())
  }
}
</script>

<style lang="less">
.swiper.expose {
  overflow: visible;
}
.swiper {
  position: relative;
  overflow: hidden;
  .swiper-items {
    height: 7.5rem;
    // todo: here is a bug, should add hidden back
    // overflow: hidden;
    position: relative;
  }
  .swiper-item {
    overflow: hidden;
    // background: #000;
    position: absolute;
    width: 100%; height: 100%;
    transform: translateX(-1000%);
    img {
      width: auto;
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .swiper-item.active {
    transform: none;
  }
  .swiper-item.mode1 img {
    width: 100%;
  }
  .swiper-item.mode2 img {
    height: 100%;
  }
  .swiper-indicators {
    position: absolute;
    bottom: 10px;
    right: 10px;
    color: #fff;
    font-size: .4rem;
    span:first-child {
      font-size: .6rem;
    }
    transform: translate3d(0, 0, 0);
  }
  .thumbnail {
    visibility: hidden;
    position: absolute;
    top: 0;
    height: 1px;
  }
}
</style>

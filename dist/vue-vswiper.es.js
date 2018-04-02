function on (element, evt, handler) {
  element.addEventListener(evt, handler, false);
}

function off (element, evt, handler) {
  element.removeEventListener(evt, handler, false);
}

/* istanbul ignore next */
var once = function (el, event, fn) {
  var listener = function () {
    if (fn) {
      fn.apply(this, arguments);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

/* istanbul ignore next */
function hasClass (el, cls) {
  if (!el || !cls) { return false }
  if (cls.indexOf(' ') !== -1) { throw new Error('className should not contain space.') }
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/* istanbul ignore next */
function addClass (el, cls) {
  if (!el) { return }
  var curClass = el.className;
  var classes = (cls || '').split(' ');

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) { continue }

    if (el.classList) {
      el.classList.add(clsName);
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/* istanbul ignore next */
function removeClass (el, cls) {
  if (!el || !cls) { return }
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) { continue }

    if (el.classList) {
      el.classList.remove(clsName);
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

function isUndefined (value) {
  return typeof value === 'undefined'
}

// for a 60Hz monitor, requestAnimationFrame will trigger the callback every 16.67ms (1000 / 60 == 16.66...)
// todo: for performance concern, add threshold, to control how many times fn will be called in one minute
var ticking = false;
function requestFrame (fn, giveup) {
  if (!giveup || !ticking) {
    window.requestAnimationFrame(function () {
      ticking = false;
      fn();
    });
    ticking = true;
  }
}

// var d1 = Date.now()
//
// function logd (s) {
//   var d2 = Date.now()
//   console.log(s, d2 - d1)
//   d1 = d2
// }

var swiper = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"swiper",class:{expose: _vm._expose}},[(_vm.thumbnails && _vm.thumbnails.length > 0)?_c('div',{staticClass:"thumbnail"},_vm._l((_vm.thumbnails),function(src){return _c('img',{attrs:{"src":src}})})):_vm._e(),_vm._v(" "),_c('div',{ref:"items",staticClass:"swiper-items"},[_vm._t("default")],2),_vm._v(" "),(_vm._indicator)?_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.slides && _vm.slides.length > 1),expression:"slides && slides.length > 1"}],staticClass:"swiper-indicators"},[_c('span',[_vm._v(_vm._s(_vm.index + 1))]),_vm._v("/"),_c('span',[_vm._v(_vm._s(_vm.slides.length))])]):_vm._e()])},staticRenderFns: [],
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
  data: function data () {
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
    _indicator: function _indicator () { return !isUndefined(this.indicator) },
    _cycle: function _cycle () { return !isUndefined(this.cycle) },
    _vertical: function _vertical () { return !isUndefined(this.vertical) },
    _expose: function _expose () { return !isUndefined(this.expose) },
    _stop: function _stop () { return !isUndefined(this.stop) },
    animatingX: function animatingX () { return this.status & 2 },
    animatingY: function animatingY () { return this.status & 4 },
    len: function len () { return this.slides ? this.slides.length : 0 },
    _width: function _width () { return this.$el.offsetWidth },
    prev: function prev () {
      return this.len > 1 && this.index === 0 && this._cycle ? this.slides[this.len - 1] : this.slides[this.index - 1]
    },
    current: function current () {
      return this.slides[this.index]
    },
    next: function next () {
      return this.len > 1 && this.index === this.len - 1 && this._cycle ? this.slides[0] : this.slides[this.index + 1]
    },
    gap: function gap () {
      var left = this.state.currentLeft - this.state.startLeft;
      var width = this.state.width;

      return Math.min(Math.max(-width, left), width)
    },
    right: function right () { return this.gap > 0 },
    target: function target () { return this.right ? this.prev : this.next },
    back: function back () { return this.right ? this.next : this.prev },
    first: function first () { return this.len > 0 ? this.slides[0] : null },
    last: function last () { return this.len > 0 ? this.slides[this.len - 1] : null }
  },
  methods: {
    // isUndefined (val) { return isUndefined(val) },
    moveAllExceptCurrent: function moveAllExceptCurrent () {
      var this$1 = this;

      var next = this.next;
      var i = 1;
      while (next) {
        this$1.moveX(next, this$1._width * i);
        next = next.next;
        i++;
      }

      var prev = this.prev;
      i = -1;
      while (prev) {
        this$1.moveX(prev, this$1._width * i);
        prev = prev.prev;
        i--;
      }
    },
    init: function init () {
      var this$1 = this;

      if (this._expose && this.boxid) {
        this.box = document.getElementById(this.boxid);
      }
      var children = this.$children;
      this.disable = children.length < 2;
      this.index = 0;
      // var width = this.$el.offsetWidth
      // debugger
      var width = this._width;
      children.forEach(function (c, i) {
        var owidth = c.width || width;
        var oheight = c.height || width;
        var slide = {
          el: c.$el,
          width: width,
          height: width * oheight / owidth
        };

        if (this$1.len > 0) { this$1.slides[this$1.len - 1].next = slide; }

        slide.prev = this$1.last;

        this$1.slides.push(slide);
        i === 0 ? addClass(c.$el, 'active') : removeClass(c.$el, 'active');

        if (!c.thumbnail) { return }

        var img = new Image();
        img.onload = function () {
          slide.height = width * img.naturalHeight / img.naturalWidth;
          if (i === 0 && !this$1.animatingX && !this$1.animatingY) { this$1.animateY(this$1.current); }
        };
        img.src = c.thumbnail;
      });

      if (this._cycle && this.len > 0) {
        this.first.prev = this.last;
        this.last.next = this.first;
      }

      var element = this.$el;
      if (!this._expose) { this.moveX(this.next, width); }
      else { this.moveAllExceptCurrent(); }

      on(element, 'touchstart', function (e) {
        this$1.onTouchStart(e);
      });

      on(element, 'touchmove', function (e) {
        if (this$1.scrolling === 2) { return }
        this$1.onTouchMove(e);
        // setTimeout(() => this.onTouchMove(e), 17)
        // window.requestAnimationFrame(() => this.onTouchMove(e))
        // e.preventDefault()
        // requestFrame(() => {
        //   this.onTouchMove(e)
        // }, true)
      });

      on(element, 'touchend', function (e) {
        if (this$1.scrolling === 2) { return }
        this$1.onTouchEnd(e);
        // setTimeout(() => this.onTouchEnd(e), 17)
        // window.requestAnimationFrame(() => this.onTouchEnd(e))
        // requestFrame(() => {
        //   requestFrame(() => this.onTouchEnd(e))
        // })
      });
    },

    moveX: function moveX (slide, offset) {
      slide && this._moveX(slide.el, offset);
    },

    _moveX: function _moveX (el, offset) {
      el.style.webkitTransition = '';
      el.style.webkitTransform = "translate3d(" + offset + "px, 0, 0)";
    },

    moveY: function moveY (from, to, offsetX) {
      if (!from || !to) { return }
      var fh = from.height;
      var th = to.height;
      if (fh === th) { return }

      var h = fh - (fh - th) * offsetX / this.state.width;
      if ((fh > th && h < to) || (fh < th) && h > to) { h = th; }

      this.$refs.items.style.height = h + 'px';
    },

    setImg: function setImg (slide) {
      if (!slide) { return }
      var height = this.$refs.items.offsetHeight;
      if (height === slide.height) { return }

      removeClass(slide.el, height > slide.height ? 'mode1' : 'mode2');
      addClass(slide.el, height > slide.height ? 'mode2' : 'mode1');
    },

    _animateX: function _animateX (el, offset) {
      this.animate(2, el, function () {
        // el.style.webkitTransition = '-webkit-transform 100ms ease-in-out'
        el.style.webkitTransition = '-webkit-transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      }, function () {
        el.style.webkitTransform = "translate3d(" + offset + "px, 0, 0)";
      });
    },

    animateX: function animateX (slide, offset) {
      slide && this._animateX(slide.el, offset);
    },

    animateY: function animateY (to) {
      var this$1 = this;

      if (!to) { return }
      var element = this.$refs.items;
      this.animate(4, element, function () {
        element.style.webkitTransition = 'height 100ms ease-in-out';
      }, function () {
        element.style.height = to.height + 'px';
      }, function () { return this$1.$emit('swipeend'); });
    },

    animate: function animate (direction, element, transition, transitionFn, fn) {
      var this$1 = this;

      // animatingX/Y: true
      this.status = this.status | direction;
      transition();
      requestFrame(transitionFn);
      var called = false;
      var callback = function () {
        if (called) { return }
        called = true;
        // animatingX/Y: false
        this$1.status = this$1.status & ~direction;
        element.style.webkitTransition = '';
        fn && fn();
      };
      once(element, 'webkitTransitionEnd', callback);
      setTimeout(callback, 520);
    },

    onTouchStart: function onTouchStart (event) {
      // debugger
      if (this.disable) { return }
      if (this.animatingX || this.animatingY) { return }
      this.scrolling = 0;

      // var element = this.$el
      var state = this.state;
      var touch = event.touches[0];

      state.startTime = Date.now();
      state.startLeft = touch.pageX;
      state.currentLeft = touch.pageX;
      state.startTop = touch.clientY;

      // var width = state.width = element.offsetWidth
      // var width = state.width = this._width
      state.width = this._width;

      // this.moveX(this.prev, -this._width)
      // this.moveX(this.next, this._width)
    },

    onTouchMove: function onTouchMove (event) {
      if (this.disable) { return }

      if (this.animatingX || this.animatingY) {
        event.preventDefault();
        return
      }

      var state = this.state;
      var touch = event.touches[0];

      state.currentLeft = touch.pageX;

      var width = this.state.width;
      var left = this.gap;
      var right = this.right;
      var target = this.target;

      if (this.scrolling === 0) {
        var x = Math.abs(left);
        var y = Math.abs(touch.clientY - state.startTop);
        if (x * 2 < y) {
          this.scrolling = 2;
          return
        } else {
          this.scrolling = 1;
        }
      }

      event.preventDefault();

      // 1.

      // if (!this._cycle || this.slides.length > 2) {
      //   this.moveX(this.back, right ? left + width : left - width)
      //   target && this.moveX(target[right ? 'prev' : 'next'], right ? left - width - width : left + width + width)
      // }

      if (this._expose) {
        // this.moveAll(left - width * this.index)
        this._moveX(this.$refs.items, left - width * this.index);
      } else {
        this.moveX(this.back, -width);
        this.moveX(this.current, left);
        this.moveX(target, right ? left - width : left + width);
      }

      // don't set vertical if expose
      if (!this._vertical) { return }

      this.moveY(this.current, target, Math.abs(left));

      this.setImg(this.current);
      this.setImg(target);
    },

    shouldCancel: function shouldCancel () {
      var width = this.state.width;
      var cancel = Math.abs(this.gap) < width / 4;
      var endTime = Date.now();
      var duration = endTime - this.state.startTime;

      return ((duration > 300 || duration < 16) && cancel) || (!this._cycle && this.right && this.current === this.first) || (!this._cycle && !this.right && this.current === this.last)
    },

    onTouchEnd: function onTouchEnd (event) {
      if (this.disable) { return }
      if (this.animatingX || this.animatingY) { return }

      var state = this.state;
      var left = this.gap;

      if (left === 0) { return }

      var width = state.width;
      var right = this.right;
      var target = this.target;
      var back = this.back;

      if (this._stop) { return }

      // don't cacnel it if the duration is short enough
      // if (((duration > 300 || duration < 16) && cancel) || (!this._cycle && right && this.current === this.first) || (!this._cycle && !right && this.current === this.last)) {
      if (this._expose) {
        if (this.shouldCancel()) {
          this._animateX(this.$refs.items, -this.index * width);
          return
        }

        this._animateX(this.$refs.items, right ? (1 - this.index) * width : (-this.index - 1) * width);
      } else {
        if (this.shouldCancel()) {
          this.moveX(back, -width);
          this.animateX(this.current, 0);
          this.animateX(target, right ? -width : width);
          return
        }

        this.moveX(back, -width);
        this.animateX(this.current, right ? width : -width);
        this.animateX(target, 0);
      }

      this._vertical && this.animateY(target);

      // set index
      var i = this.index;
      var len = this.slides.length;
      if (right) { i--; }
      else { i++; }
      if (i < 0) { i = len - 1; }
      if (i >= len) { i = 0; }
      this.index = i;
    }
  },

  mounted: function mounted () {
    this.init();

    // todo: support window resize
    // on(window, 'resize', () => this.init())
  }
}

var swiperItem = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"swiper-item mode1"},[_vm._t("default")],2)},staticRenderFns: [],
  name: 'swiper-item',
  props: ['width', 'height', 'thumbnail']
}

var index = {
  install: function install (vue, options) {
    vue.component('vswiper', swiper);
    vue.component('vswiper-item', swiperItem);
  }
}

export default index;

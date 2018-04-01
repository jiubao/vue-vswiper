<template>
  <div class="swiper-item mode1">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'swiper-item',
    props: ['width', 'height', 'thumbnail']
  }
</script>

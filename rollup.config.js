import vue from 'rollup-plugin-vue'
import json from 'rollup-plugin-json'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import cfg from './package.json'

export default {
  input: 'src/index.js',
  output: [{
    file: cfg.browser,
    format: 'umd',
    name: 'vue-vswiper'
  }, {
    file: cfg.module,
    format: 'es'
  }, {
    file: cfg.cjs,
    format: 'cjs'
  }],
  format: 'iife',
  plugins: [
    vue({
      compileTemplate: true
    }),
    // json(),
    buble({
      objectAssign: 'Object.assign',
      jsx: 'h'
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs()
  ]
}

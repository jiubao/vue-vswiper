import json from 'rollup-plugin-json'
import buble from 'rollup-plugin-buble'
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
  plugins: [
    json(),
    buble({
      objectAssign: 'Object.assign',
      jsx: 'h'
    })
  ]
}

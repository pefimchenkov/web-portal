'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_ENDPOINT: '"http://dev.tsd-group.ru:3000"',
  HOST: '"http://dev.tsd-group.ru"'
})

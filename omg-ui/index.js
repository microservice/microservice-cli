const path = require('path')
const express = require('express')
const history = require('connect-history-api-fallback')

const distPath = path.resolve(__dirname, './dist')
const publicPath = path.resolve(__dirname, './public')

const app = function() {
  const self = express()
  self.use(
    express.static(distPath, {
      maxAge: 0
    })
  )
  self.use(
    '/public',
    express.static(publicPath, {
      maxAge: 0
    })
  )
  self.use(
    history({
      disableDotRule: true,
      verbose: true
    })
  )
  self.use(
    express.static(distPath, {
      maxAge: 0
    })
  )
  self.use(
    '/public',
    express.static(publicPath, {
      maxAge: 0
    })
  )
  return self
}

module.exports = { app }

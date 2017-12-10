'use strict'

const Manager = require('./manager')
const Filesystem = require('./filesystem')
const Local = require('./adapters/local')
const Memory = require('./adapters/memory')

exports.fs = adapter => {
  return new Filesystem(adapter)
}

exports.Manager = (options = {}) => {
  return new Manager(options)
}

exports.adapters = {
  Local,
  Memory
}

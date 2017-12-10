'use strict'

const fs = require('../../lib/toolbox/fs')

let testfs = (module.exports = Object.create(fs))

testfs.mkdir = function (dir, options = {}) {
  if (dir.indexOf('should.fail') !== -1) {
    throw new Error('error creating directory')
  }

  if (dir.indexOf('should.exists') !== -1) {
    let err = new Error('error creating directory')
    err.code = 'EEXISTS'
    throw err
  }

  return fs.mkdir(dir, options)
}

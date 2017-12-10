'use strict'

const fs = require('fs')
const util = require('util')
const del = require('del')
const mkdir = require('make-dir')

module.exports = {
  readFile: util.promisify(fs.readFile),
  writeFile: util.promisify(fs.writeFile),
  copyFile: util.promisify(fs.copyFile),
  rename: util.promisify(fs.rename),
  readdir: util.promisify(fs.readdir),
  unlink: util.promisify(fs.unlink),
  stat: util.promisify(fs.stat),
  access: util.promisify(fs.access),
  chmod: util.promisify(fs.chmod),
  createWriteStream: fs.createWriteStream,
  createReadStream: fs.createReadStream,
  mkdir: mkdir,

  async perms (filePath, stat) {
    
  },

  rmdir (dir, options = {}) {
    return del([dir])
  }
}

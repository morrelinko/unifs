'use strict'

const Adapter = require('./adapter')

class MemoryAdapter extends Adapter {
  has () {}

  read () {}

  readStream () {}

  write () {}

  writeStream () {}

  rename () {}

  copy () {}

  delete () {}

  listDir (dir = null, recursive = false) {}

  deleteDir (dir) {}

  createDir (dir, options = {}) {}

  metadata (filePath) {}

  size (filePath) {}

  mimeType (filePath) {}

  setVisibility (filePath, visibility) {}

  getVisibility (filePath) {}
}

module.exports = MemoryAdapter

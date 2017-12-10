'use strict'

const utils = require('./toolbox/utils')

class Filesystem {
  constructor (adapter) {
    this.adapter = adapter
  }

  getAdapter () {
    return this.adapter
  }

  /**
   * @param {*} path
   * @return {Promise}
   */
  has (path) {
    path = utils.normalizePath(path)
    return path.length === 0 ? false : this.getAdapter().has(path)
  }

  /**
   * @param {*} path
   * @return {Promise}
   */
  read (path) {
    path = utils.normalizePath(path)
    return this.getAdapter().read(path)
  }

  /**
   * @param {*} path
   * @return {Promise}
   */
  readStream (path) {
    path = utils.normalizePath(path)
    return this.getAdapter().readStream(path)
  }

  /**
   * @param {*} path
   * @param {*} contents
   * @return {Promise}
   */
  write (path, contents) {
    path = utils.normalizePath(path)
    return this.getAdapter().write(path, contents)
  }

  /**
   * @param {*} path
   * @param {*} contents
   * @return {Promise}
   */
  writeStream (path, contents) {
    path = utils.normalizePath(path)
    return this.getAdapter().writeStream(path, contents)
  }

  delete (path) {
    path = utils.normalizePath(path)
    return this.getAdapter().delete(path)
  }

  /**
   * @param {*} path
   * @param {*} destPath
   * @return {Promise}
   */
  copy (path, destPath) {
    path = utils.normalizePath(path)
    destPath = utils.normalizePath(destPath)
    return this.getAdapter().copy(path, destPath)
  }

  /**
   * @param {*} path
   * @param {*} destPath
   * @return {Promise}
   */
  rename (path, destPath) {
    path = utils.normalizePath(path)
    destPath = utils.normalizePath(destPath)
    return this.getAdapter().rename(path, destPath)
  }

  /**
   * @param {*} path
   * @param {*} destPath
   * @return {Promise}
   */
  move (path, destPath) {
    return this.rename(path, destPath)
  }

  /**
   * @param {*} dir
   * @param {*} options
   */
  listDir (dir, options = {}) {
    dir = utils.normalizePath(dir)
    return this.getAdapter().listDir(dir)
  }
}

module.exports = Filesystem

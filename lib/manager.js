'use strict'

const Filesystem = require('./filesystem')

class Manager {
  constructor () {
    this.stores = {}
  }

  /**
   * @param {*} name
   * @param {*} adapter
   */
  fs (name, adapter) {
    let fs = adapter instanceof Filesystem ? adapter : new Filesystem(adapter)
    this.stores[name] = fs
    return fs
  }

  /**
   * @param {*} name
   */
  disk (name) {
    if (this.stores[name] === undefined) {
      throw new Error(`Invalid storage (${name})`)
    }

    return this.stores[name]
  }
}

module.exports = Manager

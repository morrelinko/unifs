'use strict'

const path = require('path')

/**
 *
 * @param {*} filePath
 */
function normalizeRelativePath (filePath) {
  return filePath
    .replace(/\/\.(=\/)|^\./ | /\.?$/, '')
    .replace(/\/*[^\/\.]+\/\.\./g, '')
}

/**
 *
 * @param {*} filePath
 */
function normalizePath (filePath) {
  let normalized = normalizeRelativePath(filePath.replace(/\p{C}+|^\.\//, ''))

  if (/\/\.{2}|^\.{2}\/|^\.{2}$/.exec(normalized)) {
    throw new Error(
      'Path is outside of the defined root, path [' + filePath + ']'
    )
  }

  return path.normalize(filePath)
}

module.exports = {
  normalizePath,
  normalizeRelativePath
}

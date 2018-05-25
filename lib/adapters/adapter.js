'use strict'

const stream = require('stream')

class Adapter {
  constructor () {
    this.prefix = null
  }

  /**
   * Checks whether a file exists
   *
   * @param {*} filePath
   */
  has (filePath) {}

  /**
   * Reads a file
   *
   * @param {String} filePath
   * @param encoding
   */
  read (filePath, encoding = null) {
    filePath = this.applyPrefix(filePath)

    return new Promise((resolve, reject) => {
      let bufs = []
      let len = 0
      let stream = this.readStream(filePath)

      stream.on('data', data => {
        bufs.push(data)
        len += data.length
      })

      stream.on('error', reject)

      stream.on('end', () => {
        let buf = Buffer.concat(bufs, len)

        if (encoding) {
          return resolve(buf.toString(encoding))
        }

        resolve(buf)
      })
    })
  }

  /**
   * Reads a file as a stream
   *
   * @param {*} filePath
   */
  readStream (filePath) {}

  /**
   * Write a new file
   *
   * @param {String} filePath
   * @param {String|Buffer} contents
   * @param {Object} options
   *
   * @returns {Promise}
   */
  write (filePath, contents, options = {}) {
    return new Promise((resolve, reject) => {
      let rs = new stream.Readable({
        read () {
          this.push(contents)
          this.push(null)
        }
      })

      rs.on('error', reject)

      return this.writeStream(filePath, rs)
    })
  }

  /**
   * Writes to file from streams
   *
   * @param {*} filePath
   * @param {*} readStream
   * @param {*} options
   */
  writeStream (filePath, readStream, options = {}) {}

  /**
   * Rename a file
   *
   * @param {*} filePath
   * @param {*} newFilePath
   */
  rename (filePath, newFilePath) {}

  /**
   * Copy a file
   *
   * @param {*} filePath
   * @param {*} newfilePath
   */
  copy (filePath, newfilePath) {}

  /**
   * Delete a file
   *
   * @param {*} filePath
   */
  delete (filePath) {}

  /**
   * List contents of a directory
   *
   * @param {*} dir
   * @param {*} recursive
   */
  listDir (dir = null, recursive = false) {}

  /**
   * Delete directory
   *
   * @param {*} dir
   */
  deleteDir (dir) {}

  /**
   * Creates a directory
   *
   * @param {*} dir
   * @param {*} options
   */
  createDir (dir, options = {}) {}

  /**
   * Get all meta data for a file or directory
   *
   * @param {*} filePath
   */
  metadata (filePath) {}

  /**
   * Get the size of a file
   *
   * @param {*} filePath
   */
  size (filePath) {}

  /**
   * Get the mime of a file
   *
   * @param {*} filePath
   */
  mimeType (filePath) {}

  /**
   * Sets the visibility for a file
   *
   * @param {*} filePath
   * @param {*} visibility
   * @return array|false file meta data
   */
  setVisibility (filePath, visibility) {}

  /**
   * Gets the visibility of a file
   *
   * @param {*} filePath
   */
  getVisibility (filePath) {}

  /**
   * Sets the path prefix
   *
   * @param {*} prefix
   */
  setPrefix (prefix) {
    this.prefix = prefix.slice(-1) === '/'
      ? prefix.slice(0, -1)
      : prefix
  }

  /**
   * @param appendPath
   * @returns {*}
   */
  applyPrefix (appendPath) {
    let { prefix } = this

    if (appendPath.slice(0, prefix.length) === prefix) {
      // If prefix already applied. skip
      return appendPath
    }

    return this.prefix + '/' + appendPath.replace(/^\/+/, '')
  }

  removePrefix (filePath) {
    return filePath.substr(this.prefix.length).replace(/^\/+/, '')
  }

  optionVisibility (options = {}) {
    let visibility = options.visibility || 'public'

    // Ensure visibility specified can only be one of 'public|private'
    if (visibility !== 'public' && visibility !== 'private') {
      visibility = 'public'
    }

    return visibility
  }
}

module.exports = Adapter

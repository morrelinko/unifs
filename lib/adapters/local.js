'use strict'

const path = require('path')
const slash = require('slash')
const fs = require('../toolbox/fs')
const Adapter = require('./adapter')

const permissions = {
  file: { public: 0o644, private: 0o600 },
  dir: { public: 0o755, private: 0o700 }
}

class LocalAdapter extends Adapter {
  constructor (options = {}) {
    super()

    if (!('prefix' in options)) {
      throw new Error('[storage] local: path prefix option is required')
    }

    this.fs = options.fs || fs
    this.setPrefix(path.normalize(options.prefix || ''))
  }

  async validate () {
    let stat = this.statInfo(this.prefix)
    let accessable = await this.fs.access(this.prefix, fs.constants.R_OK)

    if (!stat.isDirectory() || !accessable) {
      throw new Error(`The root "${this.prefix}" is not readable/writable.`)
    }
  }

  setPrefix (prefix) {
    return super.setPrefix(slash(prefix))
  }

  /**
   * {@inheritDoc}
   */
  async has (filePath) {
    filePath = this.applyPrefix(filePath)
    let stat = await this.statInfo(filePath)
    return stat !== false
  }

  /**
   * {@inheritDoc}
   */
  async write (filePath, contents, options = {}) {
    filePath = this.applyPrefix(filePath)
    await this.ensureDirectory(path.dirname(filePath))
    await this.fs.writeFile(filePath, contents)
    return true
  }

  /**
   * {@inheritDoc}
   */
  async writeStream (filePath, stream, options = {}) {
    filePath = this.applyPrefix(filePath)
    await this.ensureDirectory(path.dirname(filePath))

    let file = this.fs.createWriteStream(filePath)

    file.once('error', err => stream.emit('error', err))
    stream.pipe(file)

    return file
  }

  /**
   * {@inheritDoc}
   */
  read (filePath) {
    filePath = this.applyPrefix(filePath)
    return this.fs.readFile(filePath)
  }

  /**
   * {@inheritDoc}
   */
  readStream (filePath) {
    filePath = this.applyPrefix(filePath)

    let stream = this.fs.createReadStream(filePath)

    if (!stream) {
      return false
    }

    return stream
  }

  /**
   * {@inheritDoc}
   */
  async rename (filePath, destFilePath) {
    filePath = this.applyPrefix(filePath)
    destFilePath = this.applyPrefix(destFilePath)

    await this.ensureDirectory(path.dirname(destFilePath))
    await this.fs.rename(filePath, destFilePath)

    return true
  }

  /**
   * {@inheritDoc}
   */
  async delete (filePath) {
    filePath = this.applyPrefix(filePath)
    return this.fs.unlink(filePath)
  }

  /**
   * {@inheritDoc}
   */
  async copy (filePath, destFilePath) {
    filePath = this.applyPrefix(filePath)
    destFilePath = this.applyPrefix(destFilePath)
    await this.ensureDirectory(path.dirname(destFilePath))
    await this.fs.copyFile(filePath, destFilePath)
    return true
  }

  /**
   * {@inheritDoc}
   */
  async createDir (dir, options = {}) {
    let visibility = this.optionVisibility(options)
    dir = this.applyPrefix(dir)

    try {
      await this.fs.mkdir(dir, { mode: permissions.dir[visibility] })
      return { type: 'dir', path: dir }
    } catch (e) {
      if (e.code && e.code === 'EEXISTS') {
        // Directory already exists.
        return { type: 'dir', path: dir }
      }
    }

    return false
  }

  /**
   * {@inheritDoc}
   */
  async listDir (dir) {
    let items = []
    let location = this.applyPrefix(dir)
    let paths = await this.fs.readdir(location)

    for (let filePath of paths) {
      items.push(
        this.normalizeFileInfo(
          await this.statInfo(path.join(location, filePath))
        )
      )
    }

    return items
  }

  /**
   * {@inheritDoc}
   */
  async deleteDir (dir) {
    dir = this.applyPrefix(dir)
    await this.fs.rmdir(dir)
    return true
  }

  /**
   * {@inheritDoc}
   */
  async metadata (filePath) {
    filePath = this.applyPrefix(filePath)

    let stat = await this.statInfo(filePath)

    if (!stat) {
      return false
    }

    return this.normalizeFileInfo(stat)
  }

  /**
   * {@inheritDoc}
   */
  async getVisibility (filePath) {
    filePath = this.applyPrefix(filePath)
    let stat = await this.statInfo(filePath)
    return stat.mode & 0o0044 ? 'public' : 'private'
  }

  /**
   * {@inheritDoc}
   */
  async setVisibility (filePath, visibility) {
    filePath = this.applyPrefix(filePath)

    let stat = await this.statInfo(filePath)
    let type = stat.isDirectory() ? 'dir' : 'file'

    try {
      await this.fs.chmod(filePath, permissions[type][visibility])
    } catch (e) {
      return false
    }

    return visibility
  }

  /**
   * {@inheritDoc}
   */
  async size (filePath) {
    filePath = this.applyPrefix(filePath)
    let stat = await this.statInfo(filePath)

    if (!stat) {
      return false
    }

    return stat.size
  }

  /**
   * Ensures directory exists
   *
   * @param {*} dir Directory path
   * @throws Error if prefix directory cannot be created when it doesn't exists
   */
  async ensureDirectory (dir) {
    let info = await this.statInfo(dir)

    if (info === false || !info.isDirectory()) {
      await this.fs.mkdir(dir, { mode: permissions.dir.public })

      if ((await this.statInfo(dir)) === false) {
        throw new Error(`Unable to create base directory "${dir}"`)
      }
    }
  }

  /**
   * @param {*} stat
   */
  normalizeFileInfo (stat) {
    let info = {
      path: stat.path,
      type: this.filetypeFromStat(stat),
      modified_at: stat.mtime,
      created_at: stat.birthtime
    }

    if (info.type === 'file') {
      info.size = stat.size
    }

    return info
  }

  /**
   * Gets file/dir info
   *
   * @param {*} filePath
   * @return {} the stat object
   */
  async statInfo (filePath) {
    try {
      let stat = await this.fs.stat(filePath)

      if (!stat) {
        return false
      }

      stat.path = this.removePrefix(filePath)
      return stat
    } catch (e) {
      return false
    }
  }

  /**
   * Gets the type of a file
   *
   * @param {*} stat
   */
  filetypeFromStat (stat) {
    let type = 'file'

    if (stat.isDirectory()) {
      type = 'dir'
    } else if (stat.isSymbolicLink()) {
      type = 'link'
    }

    return type
  }
}

module.exports = LocalAdapter

'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')
const del = require('del')
const mkdir = require('make-dir')
const { assert } = require('chai')
const streams = require('memory-streams')
const isWindows = require('is-windows')
const LocalAdapter = require('../lib/adapters/local')
const testfs = require('./toolbox/fs')

describe('LocalAdapter', function () {
  let root
  let adapter

  beforeEach(function () {
    root = path.join(__dirname, '/files')
    adapter = new LocalAdapter({
      prefix: root,
      fs: testfs
    })
  })

  after(function () {
    del([`${root}/**/*`, `!${root}`])
  })

  it('applies prefix to paths', function () {
    adapter.setPrefix('uploads')
    assert.equal(adapter.applyPrefix('file.txt'), 'uploads/file.txt')
    adapter.setPrefix(root)
  })

  it('doesn\'t apply prefix more than once', function () {
    adapter.setPrefix('uploads')

    let prefixedPath
    prefixedPath = adapter.applyPrefix('file.txt')
    prefixedPath = adapter.applyPrefix(prefixedPath)
    prefixedPath = adapter.applyPrefix(prefixedPath)

    assert.equal(prefixedPath, 'uploads/file.txt')
  })

  it('creates directory', async function () {
    await adapter.createDir('testdir')
    assert.isTrue(await adapter.has('testdir'))
    await adapter.deleteDir('testdir')
  })

  it('writes to file', async function () {
    await adapter.write('note.txt', 'content')
    assert.isTrue(await adapter.has('note.txt'))
    await adapter.delete('note.txt')
  })

  it('writes to file using stream', async function () {
    let source = new streams.ReadableStream()
    source.append('hello')
    source.append('world')

    await adapter.writeStream('stream_file.txt', source)

    assert.isTrue(await adapter.has('stream_file.txt'))
    assert.equal(await adapter.read('stream_file.txt', 'utf8'), 'helloworld')
  })

  it('reads file', async function () {
    await adapter.write('read_file.txt', 'content')
    let content = await adapter.read('read_file.txt')

    assert.equal(content, 'content')
  })

  it('reads a file stream', async function () {
    await adapter.write('read_file_stream.txt', 'some \ncontent')

    return new Promise(async function (resolve, reject) {
      let content = ''
      let stream = await adapter.readStream('read_file_stream.txt')

      stream.on('data', chunk => (content += chunk))
      stream.on('error', reject)

      stream.on('end', () => {
        assert.equal(content, 'some \ncontent')
        resolve(content)
      })
    })
  })

  it('copies file', async function () {
    await adapter.write('single.log', 'log')

    assert.isTrue(await adapter.copy('single.log', 'daily.log'))
    assert.isTrue(await adapter.has('daily.log'))
    assert.isTrue(await adapter.has('single.log'))
    assert.strictEqual(
      await adapter.read('daily.log').toString(),
      await adapter.read('single.log').toString()
    )

    await adapter.delete('single.log')
    await adapter.delete('daily.log')
  })

  it('renames file', async function () {
    assert.isTrue(await adapter.write('file.log', 'content'))
    assert.isTrue(await adapter.rename('file.log', 'simple.log'))
    assert.isFalse(await adapter.has('file.log'))
    await adapter.delete('simple.log')
  })

  it('renames file to non existing directory', async function () {
    assert.isTrue(await adapter.write('file.log', 'content'))
    assert.isTrue(await adapter.rename('file.log', 'renamedir/simple.log'))
    assert.isFalse(await adapter.has('file.log'))
    await adapter.delete('renamedir/simple.log')
  })

  it('gets the size of a file', async function () {
    await adapter.write('filesize.test', 'superman')
    let size = await adapter.size('filesize.test')

    assert.typeOf(size, 'number')
    assert.equal(size, 8)
  })

  it('returns false when it fails to create directory', async function () {
    assert.isFalse(await adapter.createDir('should.fail'))
  })

  it('lists contents of a directory', async function () {
    await adapter.write('somedir/file.txt', 'contents')
    await adapter.write('somedir/base.txt', 'contents')

    let items = await adapter.listDir('somedir')

    assert.typeOf(items, 'array')
    assert.lengthOf(items, 2)
    assert.containsAllKeys(items[0], [
      'path',
      'type',
      'modified_at',
      'created_at',
      'size'
    ])
  })

  it.skip('disallows using a non-writable root', async function () {
    let unwritableRoot = path.join(__dirname, 'files/unwritable')

    assert.throws(async function () {
      await util.promisify(fs.mkdir)(unwritableRoot)
      let local = new LocalAdapter({ prefix: unwritableRoot })
      await local.validate()
    }, Error)
  })

  it('deletes directory', async function () {
    await adapter.write('path/to/file.txt', 'contents')
    assert.isTrue(await adapter.has('path/to'))

    await adapter.deleteDir('path/to')
    assert.isFalse(await adapter.has('path/to'))
  })

  it('sets file visibility to public', async function () {
    if (isWindows()) {
      return this.skip()
    }

    await adapter.write('public_file.txt', 'contents')
    await adapter.setVisibility('public_file.txt', 'public')
    let visibility = await adapter.getVisibility('public_file.txt')

    assert.equal('public', visibility)
  })

  it('sets file visibility to private', async function () {
    if (isWindows()) {
      return this.skip()
    }

    await adapter.write('private_file.txt', 'contents')
    await adapter.setVisibility('private_file.txt', 'private')

    assert.equal('private', await adapter.getVisibility('private_file.txt'))
  })

  it('sets directory visibility to public', async function () {
    if (isWindows()) {
      return this.skip()
    }

    await adapter.createDir('public_dir')
    await adapter.setVisibility('public_dir', 'public')

    assert.equal('public', await adapter.getVisibility('public_dir'))
  })

  it('sets directory visibility to private', async function () {
    if (isWindows()) {
      return this.skip()
    }
    ~await adapter.createDir('private_dir')
    await adapter.setVisibility('private_dir', 'private')

    assert.equal('private', await adapter.getVisibility('private_dir'))
  })
})

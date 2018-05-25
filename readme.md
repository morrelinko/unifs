UniFs
-------------------

Batteries included Universal Filesystem for NodeJS... 

One API to rule them all...

#### Installation

```bash
$ yarn add unifs
$ npm install unifs --save
```

#### Example

```js

const ufs = require('unifs')

let fs = ufs.fs(ufs.adapters.Local({
  prefix: __dirname
}))

fs.read('file.txt').then(data => {
  // Something
})

// or using async/await api

let data = await fs.read('file.txt')

```

#### Officially Supported Adapters

- Local 
- Memory

#### UniFs Storage Manager

storage.js

```js
const unifs = require('unifs')

let storage = (module.exports = new unifs.Manager())

// Register filesystems
storage.fs('local', unifs.adapters.Local(...))
storage.fs('static', unifs.adapters.AwsS3(...))
```

somewhere.js

```js
const storage = require('../storage')

storage.disk('static').read('someimage.png')
storage.disk('local').size('somfile.txt')
```

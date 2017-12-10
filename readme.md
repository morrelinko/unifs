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

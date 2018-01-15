# ccurl.interface.js

This is a simple node script that makes it possible to interface directly with the [cCurl Library](#https://github.com/iotaledger/ccurl) via Node-FFI. What this is for is basically for doing Proof of Work without IRI Core. Hashing with cCurl is also arguably faster.

## Install

You can simply install this package with all its dependencies (iota.lib.js and ffi) via npm:
```
$ npm install ccurl.interface.js
```

After that, you will have to compile cCurl locally on your machine. Follow the instructions on the [official repo here](#https://github.com/iotaledger/ccurl).
```
$ git clone https://github.com/iotaledger/ccurl.git
$ mkdir build && cd build && cmake .. && cd .. && make -C build
```

Then copy the `libccurl` library from the `build/lib` folder to the main directory.


## How to use

Using this library is fairly simple. You can optionally provide the full path where you have your compiled libccurl. 

### API

```
ccurl(
    trunkTransaction: string,
    branchTransaction: string,
    trytes: string[],
    minWeightMagnitude: number,
    path?: string,
    callback?: (error: Error, result: string[]) => void
): EventEmitter | void
```

When no callback is passed, the method returns an `EventEmitter` which allows you to track job progress. You must call `start` to begin the job.

#### Events:

- `'progress'`: Callback `result` is a number between 0 and 1 as a fraction of `trytes.length`
- `'done'`: Callback `result` is the array of tryte strings

#### Methods:

- `start: () => void`: Begin the job.

#### Example:

```
const ccurl = require('ccurl.interface.js')

const job = ccurl(trunkTransaction, branchTransaction, trytes, minWeightMagnitude, [, path])

job.on('progress', (err, progress) => {
    console.log(progress) // A number between 0 and 1 as a percentage of `trytes.length`
})

job.on('done', callback)

job.start()
```

See `example.js` or `test/test.js`.

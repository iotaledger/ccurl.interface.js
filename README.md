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

```
var ccurl = import('ccurl.interface.js');

ccurl(trunkTransaction, branchTransaction, trytes, minWeightMagnitude, [, path], callback)
```

See `example.js`.

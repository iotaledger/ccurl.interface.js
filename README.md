# ccurl.interface.js

This is a simple node script that makes it possible to interface directly with the [cCurl Library](#https://github.com/iotaledger/ccurl) via Node-FFI. What this is for is basically for doing Proof of Work without IRI Core. Hashing with cCurl is also arguably faster.

## How to use

First you will have to git clone this repo and then install all dependencies (iota.lib.js and ffi):
```
$ git clone https://github.com/iotaledger/ccurl.interface.js.git
$ npm install
```

After that, you will have to compile cCurl locally on your machine. Follow the instructions on the [official repoe here](#https://github.com/iotaledger/ccurl).
```
$ git clone https://github.com/iotaledger/ccurl.git
$ mkdir build && cd build && cmake .. && cd .. && make -C build
```

Then copy the `libccurl` file from the `build/lib` folder to the main directory.

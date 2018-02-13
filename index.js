'use strict';

const EventEmitter = require('events');
const IOTA = require('iota.lib.js');
const ffi = require('ffi');
const fs = require('fs');

module.exports = function(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, ccurlPath, callback) {
    // Set up the emitter and emit functions
    let emitter;

    if (!callback) {
        emitter = new EventEmitter();
    }

    function finishWithError(message) {
        const err = typeof message === 'string' ? new Error(message) : message;

        if (callback) {
            callback(err, null);
        } else {
            emitter.emit('done', err, null);
        }
    }

    function reportProgress(count) {
        if (emitter) {
            emitter.emit('progress', null, count / trytes.length);
        }
    }

    function finishWithResult(result) {
        if (callback) {
            callback(null, result);
        } else {
            emitter.emit('done', null, result);
        }
    }

    // If no file path provided, switch arguments
    if (arguments.length === 5 && Object.prototype.toString.call(ccurlPath) === "[object Function]") {
        callback = ccurlPath;
        ccurlPath = __dirname;
    } else if (arguments.length === 4) {
        ccurlPath = __dirname;
    }

    // Declare IOTA library
    const iota = new IOTA();

    const isValid = () => {
        // inputValidator: Check if correct hash
        if (!iota.valid.isHash(trunkTransaction)) {
            return finishWithError("Invalid trunkTransaction");
        }
    
        // inputValidator: Check if correct hash
        if (!iota.valid.isHash(branchTransaction)) {
            return finishWithError("Invalid branchTransaction");
        }
    
        // inputValidator: Check if int
        if (!iota.valid.isValue(minWeightMagnitude)) {
            return finishWithError("Invalid minWeightMagnitude");
        }
    
        // inputValidator: Check if array of trytes
        if (!iota.valid.isArrayOfTrytes(trytes)) {
            return finishWithError("Invalid trytes supplied");
        }
    
        // Check if file path exists
        if (!fs.existsSync(ccurlPath)) {
            return finishWithError("Incorrect file path!");
        }

        return true;
    }

    const fullPath = ccurlPath + '/libccurl';

    // Define libccurl to be used for finding the nonce
    const libccurl = ffi.Library(fullPath, {
        ccurl_pow : [ 'string', [ 'string', 'int'] ]
    });

    const finalBundleTrytes = [];
    let previousTxHash;
    let i = 0;

    function loopTrytes() {
        // Validation check must be done here since this is the entry point for the event emitter
        if (isValid()) {
            getBundleTrytes(trytes[i], function(error) {
    
                if (error) {
    
                    return finishWithError(error);
    
                } else {
    
                    i++;
    
                    if (i < trytes.length) {
    
                        reportProgress(i);
                        loopTrytes();
    
                    } else {
    
                        // reverse the order so that it's ascending from currentIndex
                        return finishWithResult(finalBundleTrytes.reverse());
    
                    }
                }
            });
        }
    }

    function getBundleTrytes(thisTrytes, bundleCallback) {
        // PROCESS LOGIC:
        // Start with last index transaction
        // Assign it the trunk / branch which the user has supplied
        // IF there is a bundle, chain  the bundle transactions via
        // trunkTransaction together

        // If this is the first transaction, to be processed
        // Make sure that it's the last in the bundle and then
        // assign it the supplied trunk and branch transactions
        if (!previousTxHash) {

            const txObject = iota.utils.transactionObject(thisTrytes);

            // Check if last transaction in the bundle
            if (txObject.lastIndex !== txObject.currentIndex) {
                return bundleCallback(new Error("Wrong bundle order. The bundle should be ordered in descending order from currentIndex"));
            }

            txObject.trunkTransaction = trunkTransaction;
            txObject.branchTransaction = branchTransaction;

            const newTrytes = iota.utils.transactionTrytes(txObject);

            // cCurl updates the nonce as well as the transaction hash
            libccurl.ccurl_pow.async(newTrytes, minWeightMagnitude, function(error, returnedTrytes) {

                if (error) {
                    return bundleCallback(error);
                }

                const newTxObject= iota.utils.transactionObject(returnedTrytes);

                // Assign the previousTxHash to this tx
                const txHash = newTxObject.hash;
                previousTxHash = txHash;

                finalBundleTrytes.push(returnedTrytes);

                return bundleCallback(null);
            });

        } else {

            const txObject = iota.utils.transactionObject(thisTrytes);

            // Chain the bundle together via the trunkTransaction (previous tx in the bundle)
            // Assign the supplied trunkTransaciton as branchTransaction
            txObject.trunkTransaction = previousTxHash;
            txObject.branchTransaction = trunkTransaction;

            const newTrytes = iota.utils.transactionTrytes(txObject);

            // cCurl updates the nonce as well as the transaction hash
            libccurl.ccurl_pow.async(newTrytes, minWeightMagnitude, function(error, returnedTrytes) {

                if (error) {

                    return bundleCallback(error);
                }

                const newTxObject= iota.utils.transactionObject(returnedTrytes);

                // Assign the previousTxHash to this tx
                const txHash = newTxObject.hash;
                previousTxHash = txHash;

                finalBundleTrytes.push(returnedTrytes);

                return bundleCallback(null);
            });
        }
    }

    if (emitter) {
        emitter.start = loopTrytes
        
        return emitter;
    }

    loopTrytes();
}

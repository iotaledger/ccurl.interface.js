'use strict';

/* eslint-disable no-console, no-unused-vars */
const assert = require('assert');
const fs = require('fs');

const ccurl = require('../index');

if (!fs.existsSync(process.env.CCURL_PATH)) {
    console.log('Usage:\n\tCCURL_PATH=/path/to/ccurl npm test')
    process.exit()
}

const sampleData = require('./sample.json');
const trunkTransaction = sampleData.trunkTransaction
const branchTransaction = sampleData.branchTransaction
const minWeightMagnitude = sampleData.minWeightMagnitude
const trytes = sampleData.trytes

const testCallback = () => new Promise((resolve, reject) => {
    ccurl(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, process.env.CCURL_PATH, (err, result) => {
        if (err) {
            reject(err);
            return;
        }
    
        assert.equal(result.length, trytes.length);
        console.log('\n' + trytes.length + ' transactions hashed.\nOK');
        resolve();
    });
})

const testEmitter = () => new Promise((resolve, reject) => {
    const jobEmitter = ccurl(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, process.env.CCURL_PATH);
    
    jobEmitter.on('progress', (err, progress) => {
        if (err) {
            return reject(err);
        }
    
        assert.equal(progress, 0.5);
        console.log('Progress reported: ' + progress + '\nOK');
    })

    jobEmitter.on('done', (err, result) => {
        if (err) {
            return reject(err);
        }
    
        assert.equal(result.length, trytes.length);
        console.log('\n' + trytes.length + ' transactions hashed.\nOK');
        console.log('Job done emitted.\nOK')
        resolve();
    });
})

testCallback().then(() => {
    return testEmitter();
}).catch(err => {
    console.error(err);
    process.exit(1);
})

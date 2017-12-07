const fs = require('fs');
const ccurl = require('../index');

if (!fs.existsSync(process.env.CCURL_PATH)) {
    console.log('Usage:\n\tCCURL_PATH=/path/to/ccurl npm test')
    process.exit()
}

const { trunkTransaction, branchTransaction, minWeightMagnitude, trytes } = require('./sample.json');
const job = ccurl(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, process.env.CCURL_PATH, (err, result) => {
    if (err) {
        console.error(err);
        process.exit();
    }

    console.log('\n' + trytes.length + ' transactions hashed.\nOK')
    process.exit();
});

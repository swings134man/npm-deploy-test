#!/usr/bin/env node

{( => {
    const opt = process.argv[0];
    console.log('\x1b[32m%s\x1b[0m',"process.argv[0]: " + process.argv[0]); // Options

    if(opt !== 'init' || opt === '' || opt === null) {
        console.log('\x1b[31m%s\x1b[0m',"Error: not required Command");
        return;
    }

})}
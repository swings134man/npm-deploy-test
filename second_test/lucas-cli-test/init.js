#!/usr/bin/env node

(() => {
    console.log('[lucas-cli] RUN.');

    const opt = process.argv[2];
    console.log("process.argv[0]: " + process.argv[2]); // Options

    if(opt !== 'init' || opt === '' || opt === null) {
        console.log("Error: not required Command");
        return;
    }

    console.log("Success: Command Run!!!");

})();
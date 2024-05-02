#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

(() => {
    console.log('[lucas-cli-test] RUN.');

    const opt = process.argv[2];
    console.log("process.argv[2] = OPTIONS : " + process.argv[2]); // Options

    if (opt !== 'init' || opt === '' || opt === null) {
        console.log("Error: not required Command");
        return;
    }

    // current directory path get
    const currentDir = process.cwd();

    // genie-config directory path generate.
    const genieConfDir = path.join(currentDir, 'genie-config');

    // Check if directory already exists
    if (!fs.existsSync(genieConfDir)) {
        // If genie-config directory is not exist make directory
        fs.mkdirSync(genieConfDir);
        console.log('make "genie-config" Directory!!');

/////////////////////////////////////////////////////////////////////////////////////////////////////
        // genie.conf.js file code write
        const genieConfCode = `
const config = {
    appName: genie.conf.js',
    version: '1.0.0'
};`
;
/////////////////////////////////////////////////////////////////////////////////////////////////////

        // genie.conf.js make file path
        const genieConfFile = path.join(genieConfDir, 'genie.conf.js');

        // genie.conf.js 파일을 생성합니다.
        fs.writeFileSync(genieConfFile, genieConfCode);
        console.log('make "genie.conf.js" file!!');
    } else {
        console.log('genie-config directory already exists.');
        return;
    }

    console.log("Success: Directory and make File Success!!");
})();
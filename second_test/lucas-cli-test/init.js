#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

(() => {
    console.log('[lucas-cli-test] RUN.');

    const opt = process.argv[2];
    console.log("OPTIONS : " + process.argv[2]); // Options

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
//////////////////////////////////////     CONF GEN     /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
        // genie.conf.js file code write
        const genieConfCode = `
const config = {
    appName: 'genie.conf.js',
    version: '1.0.0'
};`
;

        // genie.conf.js make file path
        const genieConfFile = path.join(genieConfDir, 'genie.conf.js');

        // genie.conf.js File Generated
        fs.writeFileSync(genieConfFile, genieConfCode);
        console.log('make "genie.conf.js" file!!');


/////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////      SQL GEN     /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

        // 1. SQL Dir GEN
        const sqlDirPath = path.join(genieConfDir, 'genie-sql');

            const mysqlDirPath = path.join(sqlDirPath, 'mysql');
            const oracleDirPath = path.join(sqlDirPath, 'oracle');
            const postgreDirPath = path.join(sqlDirPath, 'postgresql');
            const sqlServerDirPath = path.join(sqlDirPath, 'sqlserver');


        // 2. SQL Test Table init Gen
        const mysqlQuery = `
            CREATE TABLE nv_test_table (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                PRIMARY KEY (id)
            );
        `;

        const oracleQuery = `
            CREATE TABLE nv_test_table (
                id NUMBER NOT NULL,
                name VARCHAR2(100) NOT NULL,
                PRIMARY KEY (id)
            );
        `;

        const postgreQuery = `
            CREATE TABLE nv_test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL
            );
        `;

        const sqlServerQuery = `
            CREATE TABLE nv_test_table (
                id INT PRIMARY KEY,
                name NVARCHAR(100) NOT NULL
            );
        `;

        // 3. SQL File Generate
        const mysqlFilePath = path.join(mysqlDirPath, '01.sample.sql');
        const oracleFilePath = path.join(oracleDirPath, '01.sample.sql');
        const postgreFilePath = path.join(postgreDirPath, '01.sample.sql');
        const sqlServerFilePath = path.join(sqlServerDirPath, '01.sample.sql');

        // 4. SQL File Write
        fs.writeFileSync(mysqlFilePath, mysqlDirPath);
        fs.writeFileSync(oracleFilePath, oracleQuery);
        fs.writeFileSync(postgreFilePath, postgreQuery);
        fs.writeFileSync(sqlServerFilePath, sqlServerQuery);

        console.log('make "genie-sql" Directory and Sample Files!');

    } else {
        console.log('genie-config directory already exists.');
        return;
    }

    console.log("Success: Directory and make File Success!!");
})();
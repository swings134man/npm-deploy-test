#!/usr/bin/env node

// Main Run Script file: If you Want to Add File or Directory, You can Add Here.
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
/**
 * genie.conf-full-sample.js
 * @param {*} userCfg 코드지니 화면에서 사용자가 설정한 내용이 담겨져 있습니다.
 * @param {*} path node:path 모듈입니다.
 * @param {*} _ lodash 입니다.
 * @param {*} crypto node:crypto 모듈입니다.
 * @returns baseConfig, globalEngines, moduleCallback 세가지를 반환합니다.
 */
module.exports.getConfig = (userCfg, path, _, crypto) => {

  /**
   * 참고 
   * userCfg 는 다음과 같은 내용들을 포함하고 있습니다.
   * - (Project 정보, DB 설정 정보, 코드지니 설정 정보)
   */

  // =============================================================================== 1. baseConfig

    /**
     * baseConfig 는 현재 프로젝트에 대한 설명을 코드지니에게 알려주기 위한 Json 오브젝트입니다.
     * baseConfig 에는 다음과 같은 항목들을 기술 할 수 있습니다.
     *   - 프로젝트 생성 빌더
     *   - git repository 이름
     *   - 프로젝트 이름
     *   - 기본 패키지
     *   - 테이블 접두어
     *   - 모듈 정보
     *   - 기타 추가 정보
     */
    const baseConfig = {
    builderName: 'Test Project Builder',
    gitName: 'sampleGit',
    name: 'sampleName',
    id: 'sampleId',
    basePackage: 'com.my.sample',
    catalogSchema: 'sampledb',
    tablePrefix: 'tb_',
    modules: [
      {type: 'core', name: 'core', id: 'core', subPackage: 'core', min:1, max: 1, selected: true, color: 'primary'},
      {type: 'admin', name: 'admin', id: 'admin', subPackage: 'admin', min: 0, max: null, selected: true, color: 'orange-8'},
      {type: 'front', name: 'web', id: 'front', subPackage: 'web', min: 0, max: null, selected: true, color: 'accent'},
    ]
  };

  // =============================================================================== 2. globalEngines

  /**
   * globalEngines 은 프로젝트 루트(최상위) 기준으로 코드지니 프로젝트 빌더가 작업할 내용을 전달해 줍니다.
   * globalEngines 내부에는 DB 설정 정보 및, 최상위 설정 디렉토리 Copy 수행시 필요한 정보들이 포함되어 있습니다.
   */
  const globalEngines = [];
  const engineRootCopy = {
    engine: 'CopyAndReplaceContent',
    path : '',
    recursive: false,
    excludes: [],
    replaces: [
      {from: 'com.my.sample', to: userCfg.basePackage},
      {from: 'sample-parent', to: \`\${userCfg.id}-parent\`\},
      {from: 'sample-core', to: \`\${userCfg.id}-core\`\},
      {from: 'sample', to: userCfg.id},
      {from: 'org.mariadb.jdbc:mariadb-java-client', to: ''}, // DB Driver 설정(Sample)
      {from: \`DB_DRIVER: '1.0.0'\`, to: \`DB_DRIVER: ''\`},
      {
        regex: '',
        to: 'Custom Module 설정(userCfg.modules)에 따른 추가 설정이 필요합니다.'
      },
      {
        regex: '',
        to: 'Custom Module 설정(userCfg.modules)에 따른 추가 설정이 필요합니다. (Version, Description, etc.)'
      }
    ]
  };
  globalEngines.push(engineRootCopy);

  // .genie 설정 디렉토리 파일 카피
  const engineGenieCopy = {
    engine: 'CopyAndReplaceContent',
    path : '.sample',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'com.my.sample', to: userCfg.basePackage},
      {from: 'sampledb.', to: userCfg.jdbc.schemaName ? \`\${userCfg.jdbc.schemaName}\`\ : ''}, 
      {from: 'sampledb', to: userCfg.jdbc.schemaName ? \`\${userCfg.jdbc.schemaName}\`\ : ''},
      {from: 'tb_', to: userCfg.jdbc.tablePrefix},
      {from: '"sample"', to: ''}, //"\${userCfg.id}"
      {from: 'sample', to: userCfg.idVar},
      {from: 'sample', to: userCfg.idName}
    ]
  }
  globalEngines.push(engineGenieCopy);

  // .genie 설정 디렉토리 파일명 변경
  // 사용자가 설정한 테이블 접두어로 .genie/ 디렉토리 내에 있는 파일명을 변경합니다.
  const engineGenieRename = {
    engine: 'RenameFile',
    path : '.genie',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'tb_', to: userCfg.jdbc.tablePrefix}
    ]
  }
  globalEngines.push(engineGenieRename);

  // genie-sql 설정 디렉토리 파일 카피
  // - genie-sql/ 디렉토리는 설정 초기 필요한 Init SQL 파일들을 포함합니다.
  const engineGenieSqlCopy = {
    engine: 'CopyAndReplaceContent',
    path : path.join('genie-sql', 'DB Name 작성'),
    to : 'genie-sql',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'tb_', to: userCfg.jdbc.tablePrefix},
    ]
  }
  globalEngines.push(engineGenieSqlCopy);


  // =============================================================================== 3. moduleCallback
  // 코드지니에서 사용자가 선택한 모듈별로 이 메소드가 호출됩니다.
  const moduleCallback = (md) => {
    /**
     * md 는 사용자가 선택한 모듈 정보가 담겨져 있습니다.
     * 코드지니에서 설정한 내용을 기반으로, 해당 모듈에 대한 설정을 반환합니다.
     * 또한 해당 moduleCallback 에서 설정한 내용을 반환함에 따라, 각 모듈별 상세 설정이 가능합니다.
     *
     * 특정 경로의 디렉토리 및 파일들을 생성에서 제외시킬 수 있으며, 해당 내용을 반환하여 코드지니에게 전달합니다.
     *
     * Ex) Redis 사용 X 시, 해당 모듈의 Redis 설정 파일을 제외할 수 있습니다.
     */
    const moduleCamel = _.camelCase(md.id);
    const moduleName = _.upperFirst(moduleCamel);
    const typeName = _.upperFirst(_.camelCase(md.type));
    const engines = []; // moduleCallback 내부에 설정한 내용들은 해당 변수에 담아서 반환합니다.

    // copy module directory
    const moduleEngine = {
      engine: 'CopyAndReplaceContent',
      path : md.type,
      to : md.id,
      recursive: true, // recursive 가 false 이면, 디렉토리는 제외
      excludes: [],
      replaces: [
        {from: \`com.my.sample.\${md.type}\`, to: \`\${userCfg.basePackage}.\${md.subPackage}\`},
        {from: 'com.my.sample', to: userCfg.basePackage},
        {from: 'sampledb', to: userCfg.catalogSchema},
        {from: 'sample-core', to: \`\${userCfg.id}-core\`},
        {from: \`sample-\${md.type}\`, to: \`\${userCfg.id}-\${md.id}\`},
        {from: \`\${md.type}Properties\`, to: \`\${moduleCamel}Properties\`},
        {from: '"sample"', to: \`"\${userCfg.id}"\`},
        {from: '@ComponentScan({"com.my"})', to: \`@ComponentScan({"com.my", "\${userCfg.basePackage}"})\`},
      ],
      renames: [
        {from: \`sample\${typeName}\`, to: \`\${userCfg.idName}\${moduleName}\`},
      ]
    }
    engines.push(moduleEngine);

    // 각 모듈의 Back-end 소스 경로를 추가합니다.
    let mdName = md.id;
    if(md.type === 'admin' || md.type === 'test-front') {
        mdName += path.sep + 'backend';
    }

    engines.push(Object.assign({}, {javaBase: path.join(mdName, 'src', 'test', 'java')} ));

    return engines;
  }

  // 최종적으로 설정 정보를 반환합니다.
  return {
    baseConfig, globalEngines, moduleCallback
  }
}
`;

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
        fs.mkdirSync(sqlDirPath);

            const mysqlDirPath = path.join(sqlDirPath, 'mysql');
            const oracleDirPath = path.join(sqlDirPath, 'oracle');
            const postgreDirPath = path.join(sqlDirPath, 'postgresql');
            const sqlServerDirPath = path.join(sqlDirPath, 'sqlserver');

        fs.mkdirSync(mysqlDirPath);
        fs.mkdirSync(oracleDirPath);
        fs.mkdirSync(postgreDirPath);
        fs.mkdirSync(sqlServerDirPath);


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
        fs.writeFileSync(mysqlFilePath, mysqlQuery);
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
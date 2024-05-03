const maker = require('./genie.maker');
module.exports.getConfig = (userCfg, path, _, crypto) => {
  const maker = require('./genie.maker.js');

  const baseConfig = {
    builderName: 'Unvus iFlex Project Builder',
    gitName: 'iflex',
    name: 'iflex',
    id: 'iflex',
    basePackage: 'com.unvus.iflex',
    catalogSchema: 'iflexdb',
    tablePrefix: 'nv_',
    modules: [
      {type: 'core', name: 'core', id: 'core', subPackage: 'core', min:1, max: 1, selected: true, color: 'primary'},
      {type: 'batch', name: 'batch', id: 'batch', subPackage: 'batch', min: 0, max: 1, selected: true, color: 'info'},
      {type: 'cms', name: 'cms', id: 'cms', subPackage: 'cms', min: 0, max: null, selected: true, color: 'orange-8'},
      {type: 'channel', name: 'pc web', id: 'pc-web', subPackage: 'web.pc', min: 0, max: null, selected: true, color: 'accent'},
      {type: 'channel-vue', name: 'mobile web', id: 'mobile-web', subPackage: 'web.mobile', min: 0, max: null, selected: true, color: 'green-9'},
    ]
  };


  const jdbcDrivers = {
    'MariaDB': {driver: 'org.mariadb.jdbc:mariadb-java-client', version: '3.3.2'},
    'MySQL': {driver: 'com.mysql:mysql-connector-j', version: '8.3.0'},
    'Oracle': {driver: 'com.oracle.database.jdbc:ojdbc11', version: '23.3.0.23.09'},
    'PostgreSQL': {driver: 'org.postgresql:postgresql', version: '42.7.1'},
    'SQLServer': {driver: 'com.microsoft.sqlserver:mssql-jdbc', version: '12.6.1.jre11'}
  }

  const dataSourceName = userCfg.jdbc.dataSource.name;
  const driver = jdbcDrivers[dataSourceName];

  // 최상위 디렉토리 파일 카피
  const engineRootCopy = {
    engine: 'CopyAndReplaceContent',
    path : '',
    recursive: false, // recursive 가 false 이면, 디렉토리는 제외
    excludes: [],
    replaces: [
      {from: 'com.unvus.iflex', to: userCfg.basePackage},
      {from: 'iflex-parent', to: `${userCfg.id}-parent`},
      {from: 'iflex-core', to: `${userCfg.id}-core`},
      {from: 'iflex', to: userCfg.id},
      {from: 'Iflex', to: userCfg.idName},
      {from: 'org.mariadb.jdbc:mariadb-java-client', to: driver.driver},
      {from: `DB_DRIVER: '3.0.4'`, to: `DB_DRIVER: '${driver.version}'`},
      {
        regex: '/<!--codegenie-needle-gradle-modules-start(.|\\n)*?codegenie-needle-gradle-modules-end-->/g',
        to: maker.getToModules(userCfg)
      },
      {
        regex: '/\\/\\/ codegenie-needle-gradle-sub-start(.|\\n)*?codegenie-needle-gradle-sub-end/g',
        to: maker.getToSubs(userCfg)
      }
    ]
  };

  // .genie 설정 디렉토리 파일 카피
  const engineGenieCopy = {
    engine: 'CopyAndReplaceContent',
    path : '.genie',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'com.unvus.iflex', to: userCfg.basePackage},
      {from: 'iflexdb.', to: userCfg.jdbc.schemaName ? `${userCfg.jdbc.schemaName}.` : ''},
      {from: 'iflexdb', to: userCfg.jdbc.schemaName ? `${userCfg.jdbc.schemaName}` : ''},
      {from: 'nv_', to: userCfg.jdbc.tablePrefix},
      {from: "'iflex'", to: `'${userCfg.id}'`},
      {from: '"iflex"', to: `"${userCfg.id}"`},
      {from: 'iflex', to: userCfg.idVar},
      {from: 'Iflex', to: userCfg.idName}
    ]
  }

  // .genie 설정 디렉토리 파일명 변경
  const engineGenieRename = {
    engine: 'RenameFile',
    path : '.genie',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'nv_', to: userCfg.jdbc.tablePrefix}
    ]
  }

  // genie-sql 설정 디렉토리 파일 카피
  const engineGenieSqlCopy = {
    engine: 'CopyAndReplaceContent',
    path : path.join('genie-sql', maker.getDbName(userCfg)),
    to : 'genie-sql',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'nv_', to: userCfg.jdbc.tablePrefix},
      {from: 'codegenie-needle-insert-channel-DO_NOT_DELETE_THIS_LINE', to: JSON.stringify(maker.getJsonChannel(userCfg))},
      {from: 'codegenie-needle-insert-auth-DO_NOT_DELETE_THIS_LINE', to: JSON.stringify(maker.getJsonAuth(userCfg))}
    ]
  }

  const globalEngines = [engineRootCopy, engineGenieCopy, engineGenieRename, engineGenieSqlCopy];

  // paid
  if(!userCfg.paid) {
    engineGenieCopy.excludes.push('**/tables/nv_batch_**');
    engineGenieCopy.excludes.push('**/tables/nv_msg_**');
    engineGenieSqlCopy.excludes.push('**/04.batch.sql');
    engineGenieSqlCopy.excludes.push('**/08.message.sql');
  }

  const jwtKey = crypto.randomBytes(128).toString('base64');
  const firoKey = crypto.randomBytes(32).toString('hex');

  const dialectMap = {
    'MariaDB': 'MariaDB103Dialect',
    'MySQL': 'MySQL57Dialect',
    'PostgreSQL': 'PostgreSQLDialect',
    'Oracle': 'OracleDialect',
    'SQLServer': 'SQLServerDialect',
  };

  const moduleCallback = (md) => {
    const moduleCamel = _.camelCase(md.id);
    const moduleName = _.upperFirst(moduleCamel); // MobileWeb
    const typeName = _.upperFirst(_.camelCase(md.type)); // Channel
    const engines = [];
    // copy module directory
    const moduleEngine = {
      engine: 'CopyAndReplaceContent',
      path : md.type,
      to : md.id,
      recursive: true, // recursive 가 false 이면, 디렉토리는 제외
      excludes: [],
      replaces: [
        {from: '6cnq3t43eB8bW/2w7JHqieG0RyhImDEwBy6ju7Eqamlco5+PVy56KSkVzAPUfFkZxcpglBJgO9vKKRieX5UTnueycwwk0fPKvBlqA7MV1SEri29jS/XRWsbc5F+GPktky02vH2Lc2mV/u4dwOqXRYPtROAYYEy5XjRC6o8B3cZI=', to: jwtKey},
        {from: 'mExYTViNzQzOTE3YmQ4OWY3NTE4MmRkOTg2YmM2NjAyMjVjZTNjNjFkYzZjRhOTlhYWVhNGRjNT', to: firoKey},
        {from: 'MySQL57Dialect', to: dialectMap[dataSourceName]},
        {from: `com.unvus.iflex.${md.type}`, to: `${userCfg.basePackage}.${md.subPackage}`},
        {from: 'com.unvus.iflex', to: userCfg.basePackage},
        {from: 'iflexdb.', to: userCfg.catalogSchema ? `${userCfg.catalogSchema}.` :''},
        {from: 'iflexdb', to: userCfg.catalogSchema},
        {from: 'iflex-parent', to: `${userCfg.id}-parent`},
        {from: 'iflex-core', to: `${userCfg.id}-core`},
        {from: `iflex - ${md.type}`, to: `${userCfg.name} - ${md.id}`},
        {from: `iflex-${md.type}`, to: `${userCfg.id}-${md.id}`},
        {from: `iflex ${md.type}`, to: `${userCfg.name} ${md.id}`},
        {from: `${typeName}Properties`, to: `${moduleName}Properties`},
        {from: `${md.type}Properties`, to: `${moduleCamel}Properties`},
        {from: `iflex${typeName}`, to: userCfg.idVar + moduleName},
        {from: `Iflex${typeName}`, to: userCfg.idName + moduleName},
        {from: "'iflex'", to: `'${userCfg.id}'`},
        {from: '"iflex"', to: `"${userCfg.id}"`},
        {from: 'iflex', to: userCfg.idVar},
        {from: 'Iflex', to: userCfg.idName},
        {from: '@ComponentScan({"com.unvus"})', to: `@ComponentScan({"com.unvus", "${userCfg.basePackage}"})`},
        {
          regex: '/# code-genie-replace-start-db(.|\\n)*?# code-genie-replace-end-db/g',
          to: maker.getToDb(userCfg)
        },
        {
          regex: '/# code-genie-replace-sites-local-start(.|\\n)*?# code-genie-replace-sites-local-end/g',
          to: maker.getSitesLocal(userCfg)
        },
        {
          regex: '/# code-genie-replace-sites-dev-start(.|\\n)*?# code-genie-replace-sites-dev-end/g',
          to: maker.getSitesDev(userCfg)
        },
        {
          regex: '/# code-genie-replace-sites-prod-start(.|\\n)*?# code-genie-replace-sites-prod-end/g',
          to: maker.getSitesProd(userCfg)
        }
      ],
      renames: [
        {from: `Iflex${typeName}`, to: `${userCfg.idName}${moduleName}`},
        {from: `iflex-${md.type}-`, to: `${userCfg.id}-${md.id}-`},
        {from: 'IflexConstants', to: `${userCfg.idName}Constants`},
        {from: `${typeName}Properties`, to: `${moduleName}Properties`},
        {from: 'IflexWebUtil', to: `${userCfg.idName}WebUtil`}
      ]
    }

    if(md.type === 'core') {
      moduleEngine.replaces.push({from: 'tablePrefix = "nv_"', to: `tablePrefix = "${userCfg.jdbc.tablePrefix}"`});
      if (dataSourceName === 'MariaDB' || dataSourceName === 'MySQL') {
        moduleEngine.excludes.push('**/StatisticRepository_**');
      }else {
        moduleEngine.excludes.push('**/StatisticRepository.xml');
        _.each(dialectMap, (val, key) => {
          if(key !== dataSourceName) {
            moduleEngine.excludes.push(`**/StatisticRepository_${key}.xml`);
          }
        })
        moduleEngine.replaces.push({from: `StatisticRepository_${dataSourceName}`, to: 'StatisticRepository'});
        moduleEngine.renames.push({from: `StatisticRepository_${dataSourceName}`, to: 'StatisticRepository'})
      }
    }

    if(!userCfg.redis.use) { // 레디스 사용 안함
      moduleEngine.excludes.push('**/RedisConfiguration**');
      moduleEngine.excludes.push('**/CacheConfig**');
      moduleEngine.replaces.push({
        regex: '/\\/\\/ codegenie-needle-gradle-redis-start(.|\\n)*?codegenie-needle-gradle-redis-end/g', to: ''
      });
      moduleEngine.replaces.push({
        regex: '/# codegenie-needle-yml-redis-start(.|\\n)*?# codegenie-needle-yml-redis-end/g', to: ''
      });
      moduleEngine.replaces.push({
        regex: 'public final static String CACHED(.)*?$/g', to: ''
      });
      moduleEngine.replaces.push({
        regex: '@CacheEvict(.)*?$/g', to: ''
      });
      moduleEngine.replaces.push({
        regex: '@Cacheable(.)*?$)/g', to: ''
      });
    }else {
      moduleEngine.replaces.push(
        { from: 'host: unvus.com', to: `host: ${userCfg.redis.host}`},
        { from: 'port: 16379', to: `port: ${userCfg.redis.port}`},
        { from: 'password: unvus!redis12!@', to: !userCfg.redis.password?'':`password: ${userCfg.redis.password}`},
      )
    }

    // paid
    if(!userCfg.paid) {
      moduleEngine.excludes.push('**/views/batch');
      moduleEngine.excludes.push('**/views/message');
      moduleEngine.excludes.push('**/sql/batch');
      moduleEngine.excludes.push('**/sql/message');
      moduleEngine.excludes.push('**/sql/statistic');
      moduleEngine.excludes.push('**/modules/batch');
      moduleEngine.excludes.push('**/modules/message');
      moduleEngine.excludes.push('**/modules/statistic');
      moduleEngine.excludes.push('**/cms/rest/message/**');
      moduleEngine.excludes.push('**/rest/Batch**');
      moduleEngine.excludes.push('**/rest/Msg**');
      moduleEngine.excludes.push('**/rest/Statistic**');
      moduleEngine.excludes.push('**/platform/batch');
      moduleEngine.replaces = [
        { from: 'import com.unvus.iflex.core.modules.batch.service.BatchFileDownloadService;', to: ''},
        { from: 'private final BatchFileDownloadService batchDownloadService;', to: ''},
        { from: ', BatchFileDownloadService batchDownloadService', to: ''},
        { from: 'this.batchDownloadService = batchDownloadService;', to: ''},
        {
          regex: '/\\/\\/ codegenie-needle-paid-start-DO_NOT_DELETE_THIS_LINE(.|\\n)*?codegenie-needle-paid-end-DO_NOT_DELETE_THIS_LINE/g',
          to: ''
        },
        {from: '[JsonConfigType.ACNT_POLICY, { title: \'계정 정책\', comp: () => AccountPolicyDetail }],', to: ''},
        ...moduleEngine.replaces];
    }

    engines.push(moduleEngine);

    // ========================================================================================== move package directory
    let mdName = md.id;
    if(md.type === 'cms' || md.type === 'channel-vue') {
      mdName += path.sep + 'backend'
    }

    const renameBase = {
      engine: 'MoveJavaPackage',
      javaBase: path.join(mdName, 'src', 'main', 'java'),
      fromPackage: baseConfig.basePackage + '.' + md.type,
      toPackage: userCfg.basePackage + '.' + md.subPackage
    };

    engines.push(renameBase);

    engines.push(Object.assign({}, renameBase, {javaBase: path.join(mdName, 'src', 'test', 'java')} ));

    if(md.type === 'core') {
      engines.push(Object.assign({}, renameBase, {javaBase: path.join(mdName, 'src', 'main', 'generated-java')} ));

      const replaceBase = [
        {from: 'iflexdb.', to: userCfg.jdbc.schemaName ? `${userCfg.jdbc.schemaName}.` : ''},
        {from: 'iflexdb', to: userCfg.jdbc.schemaName ? `${userCfg.jdbc.schemaName}` : ''},
        {from: 'nv_', to: userCfg.jdbc.tablePrefix}
      ];
      const replaceSql = {
        engine: 'ReplaceContent',
        path: path.join(md.id, 'src', 'main', 'resources', 'mybatis', 'sql'),
        recursive: true, excludes: [],
        replaces: [...replaceBase, ...maker.getReplaceSql(dataSourceName)],
      }
      const replaceGeneratedSql = {
        engine: 'ReplaceContent',
        path: path.join(md.id, 'src', 'main', 'generated-resources', 'mybatis', 'sql'),
        recursive: true, excludes: [],
        replaces: [...replaceBase, ...maker.getReplaceGeneratedSql(dataSourceName)],
      }
      engines.push(replaceSql, replaceGeneratedSql);

    }

    return engines;
  }

  return {
    baseConfig, globalEngines, moduleCallback
  }
}

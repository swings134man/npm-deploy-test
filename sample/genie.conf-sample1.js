module.exports.getConfig = (userCfg, path, _,) => {

  const baseConfig = {
    builderName: 'Test Project Builder',
    gitName: 'sampleGit',
    name: 'sampleName',
    id: 'sampleId',
    basePackage: 'com.my.sample',
    catalogSchema: 'sampledb',
    tablePrefix: 'tv_',
    modules: [
      {type: 'core', name: 'core', id: 'core', subPackage: 'core', min:1, max: 1, selected: true, color: 'primary'},
      {type: 'admin', name: 'admin', id: 'admin', subPackage: 'admin', min: 0, max: null, selected: true, color: 'orange-8'},
      {type: 'front', name: 'web', id: 'front', subPackage: 'web', min: 0, max: null, selected: true, color: 'accent'},
    ]
  };

  const engineRootCopy = {
    engine: 'CopyAndReplaceContent',
    path : '',
    recursive: false,
    excludes: [],
    replaces: [
      {from: 'com.my.sample', to: userCfg.basePackage},
      {from: 'sample-parent', to: `${userCfg.id}-parent`},
      {from: 'sample-core', to: `${userCfg.id}-core`},
      {from: 'sample', to: userCfg.id},
      {from: 'org.mariadb.jdbc:mariadb-java-client', to: ''},
      {from: `DB_DRIVER: '1.0.0'`, to: `DB_DRIVER: ''`},
      {
        regex: '',
        to: maker.getToModules(userCfg)
      },
      {
        regex: '',
        to: maker.getToSubs(userCfg)
      }
    ]
  };

  // .genie 설정 디렉토리 파일 카피
  const engineGenieCopy = {
    engine: 'CopyAndReplaceContent',
    path : '.sample',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'com.my.sample', to: userCfg.basePackage},
      {from: 'sampledb.', to: userCfg.jdbc.schemaName ? `${userCfg.jdbc.schemaName}.` : ''},
      {from: 'sampledb', to: userCfg.jdbc.schemaName ? `${userCfg.jdbc.schemaName}` : ''},
      {from: 'tv_', to: userCfg.jdbc.tablePrefix},
      {from: '"sample"', to: `"${userCfg.id}"`},
      {from: 'sample', to: userCfg.idVar},
      {from: 'sample', to: userCfg.idName}
    ]
  }

  // .genie 설정 디렉토리 파일명 변경
  const engineGenieRename = {
    engine: 'RenameFile',
    path : '.genie',
    recursive: true,
    excludes: [],
    replaces: [
      {from: 'tv_', to: userCfg.jdbc.tablePrefix}
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
      {from: 'tv_', to: userCfg.jdbc.tablePrefix},
    ]
  }

  const globalEngines = [engineRootCopy, engineGenieCopy, engineGenieRename, engineGenieSqlCopy];


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
        {from: `com.my.sample.${md.type}`, to: `${userCfg.basePackage}.${md.subPackage}`},
        {from: 'com.my.sample', to: userCfg.basePackage},
        {from: 'sampledb', to: userCfg.catalogSchema},
        {from: 'sample-parent', to: `${userCfg.id}-parent`},
        {from: 'sample-core', to: `${userCfg.id}-core`},
        {from: `sample-${md.type}`, to: `${userCfg.id}-${md.id}`},
        {from: `${typeName}Properties`, to: `${moduleName}Properties`},
        {from: `${md.type}Properties`, to: `${moduleCamel}Properties`},
        {from: '"sample"', to: `"${userCfg.id}"`},
      ],
      renames: [
        {from: `sample${typeName}`, to: `${userCfg.idName}${moduleName}`},
      ]
    }
    engines.push(moduleEngine);

    engines.push(Object.assign({}, renameBase, {javaBase: path.join(mdName, 'src', 'test', 'java')} ));

    return engines;
  }

  return {
    baseConfig, globalEngines, moduleCallback
  }
}

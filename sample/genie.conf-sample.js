/**
 * 
 * @param {*} userCfg 코드지니 화면에서 사용자가 설정한 내용이 담겨져 있습니다.
 * @param {*} path node:path 모듈입니다.
 * @param {*} _ lodash 입니다.
 * @returns baseConfig, globalEngines, moduleCallback 세가지를 반환합니다.
 */
module.exports.getConfig = (userCfg, path, _,) => {
  /**
   * 참고 
   * userCfg 는 다음과 같은 구조로 되어 있습니다.
   * 어쩌구 저쩌구
   */

  // =============================================================================== 1. baseConfig
  // baseConfig 는 현재 프로젝트에 대한 설명을 코드지니에게 알려주기 위한 Json 오브젝트입니다.
  // baseConfig 에는 다음과 같은 항목들을 기술 할 수 있습니다.

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
  // globalEngines 은 프로젝트 루트(최상위) 기준으로 코드지니 프로젝트 빌더가 작업할 내용을 전달해 줍니다.

  const globalEngines = [];
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
  globalEngines.push(engineRootCopy);

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
      {from: 'tb_', to: userCfg.jdbc.tablePrefix},
      {from: '"sample"', to: `"${userCfg.id}"`},
      {from: 'sample', to: userCfg.idVar},
      {from: 'sample', to: userCfg.idName}
    ]
  }
  globalEngines.push(engineGenieCopy);

  // .genie 설정 디렉토리 파일명 변경
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
  const engineGenieSqlCopy = {
    engine: 'CopyAndReplaceContent',
    path : path.join('genie-sql', maker.getDbName(userCfg)),
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
     * md 는 이렇게 생겼습니다.
     * 어쩌구 저쩌구
     */
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

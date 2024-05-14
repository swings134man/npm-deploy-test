# npm-deploy-test

## Description

This Is A Test Repository For JS Library Publish To NPM<br>
With GitHub Action.


### For USER
>1. you must install the lucas-cli-test
>2. You need to go to the <b>top of your project module directory.</b>
>3. And use Command Line ``lucas-cli-test init``
>4. The final step is to edit the created files!

### Command Line
```bash
cd {Your Modules Directory}

npm i -g lucas-cli-test

lucas-cli-test init
```

### For Developer

### For Manual Update
>1. You can Use Files -> ``init.js`` and ``package.json``
>> * If you Fix Files. You Must be fix <b>Version</b> in ``package.json``<br>
   >> -> ex) "version": "0.0.1" to "version": "0.0.2" <br><br>
   >> Or Using CLI Commands in Root Directory -> ``npm version patch`` || ``npm version minor`` || ``npm version major`` <br>
   >> -> This Command Will Update Version Automatically For Update.

but This Repository Setting CI/CD For Auto Deploy Check the ``.github/workflows/npm-publish.yml``<br>
And make this flow, you need to Npm Token

<br><br>
## Develop Steps 

* Check List<br/>
@{OrganizationName}/{PackageName}

### Init
1. Create Directory 
2. ``npm init --scope={OrganizationName}`` = npm init --scope=lucas134
3. Make ``index.js``  file

`Or You can Pass the 'OrganizationName'`

```bash
npm init --scope=lucas134
cd lucas-util cat > index.js

# Pass Ver 
npm init
```


### Test
1. make another directory
2. ``npm link {OrganizationName}/{PackageName}`` = npm link lucas134/lucas-util
3. ./ dir make ``index.js`` file
4. ```node index.js``` Scipt Run
5. Check The Console

** ```npm ls -g --depth=0``` => local global package list <br/>
** ```npm uninstall -g {OrganizationName}/{PackageName}``` => uninstall global package
** npm repo delete => on 72 hours delete the package => npm unpublish {pacakgeName} -f

### Deploy
1. ```npm login```
2. ```npm publish --access public```
3. check The NPM Page



----
## Install

1. ``npm install @{OrganizationName}/{PackageName}``
-> you can add options 


--- 

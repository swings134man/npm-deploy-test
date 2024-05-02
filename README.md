# npm-deploy-test

## Description

This Is A Test Repository For JS Library Publish To NPM

### Develop Steps 

* Check List<br/>
@{OrganizationName}/{PackageName}

### Init
1. Create Directory 
2. ``npm init --scope={OrganizationName}`` = npm init --scope=lucas134
3. Make ``index.js``  file


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
### TODO 

1. NPM Version Limit >=18
2. Using Command Line -> lucas-util init


--- 
npm i g codegenie <br/>
codegenie init
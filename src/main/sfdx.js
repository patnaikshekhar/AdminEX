const sfdx = require('sfdx-node')
const fs = require('fs')
require('util.promisify').shim()
const { exec } = require('child_process')
const { log } = require('./utilities')

const authDevHub = (project) => new Promise((resolve, reject) => {
  const devHubAlias = `${project.name + 'DevHub'}`

  sfdx.auth.webLogin({
    setdefaultdevhubusername: true,
    setalias: devHubAlias
  }).then(() => resolve(devHubAlias))
    .catch(e => reject(e))
}) 

const authWithStore = (name, storeFile) => {

  //const devHubAlias = `${name + 'DevHub'}`

  return sfdx.auth.sfdxurlStore({
    setalias: name,
    sfdxurlfile: storeFile
  })
}

const createScratchOrg = (project, options) => {
  
  const createScratchOrgOptions = {
    targetdevhubusername: project.devHubAlias,
    setalias: options.alias,
    definitionfile: options.location
  }

  log(`Create Scratch Org Called with ${JSON.stringify(createScratchOrgOptions, null, 2)}`, 'Info')

  return sfdx.org.create(createScratchOrgOptions)
  .then(result => {
    console.log('createScratchOrg result', result)
    if (!result) {
      throw('Could not create scratch org. Please check settings.')
    }
  })
  .then(() => options)
}  

const openScratchOrg = (options) => 
  sfdx.org.open({
    targetusername: options.alias
  }).then(() => options)


const deleteScratchOrg = (options) => 
  sfdx.org.delete({
    targetusername: options.alias,
    noprompt: true
  }).then(() => options)

const pushSource = (project, options) => {
  process.chdir(project.directory)
  return sfdx.source.push({
    targetusername: options.alias || options.scratchOrg,
    forceoverwrite: true,
    ignorewarnings: true
  })
  .then((result) => console.log('pushSource', result))
  .then(() => options)
}

const createProjectDirectory = (project) => new Promise((resolve, reject) => {
  fs.readFile(`${project.directory}/sfdx-project.json`, (err, data) => {
    if (err) {
      reject(err)
    } else {
      try {
        const settings = JSON.parse(data.toString())
        settings.packageDirectories.forEach(setting => {
          if (setting.default == true) {
            if(!fs.existsSync(`${project.directory}/${setting.path}`)) {
              fs.mkdir(`${project.directory}/${setting.path}`, err => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
            } else {
              resolve()
            }
          }
        })
      } catch(e) {
        reject(e)
      }
    }
  })
})

const pullSource = (project, options) => {
  process.chdir(project.directory)
  return createProjectDirectory(project)
    .then(() => console.log('Dir created'))
    .then(() => sfdx.source.pull({
      targetusername: options.alias,
      forceoverwrite: true
    }))
}

const getOrgList = (project) =>
  sfdx.org.list()
    .then(data => {
      const devHubOrgs = data.nonScratchOrgs.filter(org => org.alias == project.devHubAlias)
      if (devHubOrgs.length > 0) {
        return data.scratchOrgs
                .filter(org => org.devHubOrgId == devHubOrgs[0].orgId)
                .map(org => org.alias)
      } else {
        return []
      }
    })

module.exports = {
  authDevHub,
  authWithStore,
  createScratchOrg,
  openScratchOrg,
  pushSource,
  getOrgList,
  deleteScratchOrg,
  pullSource
}
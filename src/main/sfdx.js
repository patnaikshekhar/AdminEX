const sfdx = require('sfdx-node')
const fs = require('fs')
require('util.promisify').shim()
const { exec } = require('child_process')
const { log } = require('./utilities')
const jsforce = require('jsforce')
const keys = require('../../keys.json')
const request = require('request-promise')
const Constants = require('./constants')
const MAIN_DIRECTORY = Constants.MAIN_DIRECTORY

const DEPLOY_POLL_INTERVAL = 2000

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

const openOrg = (alias) => 
  sfdx.org.open({
    targetusername: alias
  })


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

const getLimits = (alias) => 
  sfdx.limits.apiDisplay({
    targetusername: alias
  })

const convertToMDAPI = (projectDirectory, directory) => {
  process.chdir(projectDirectory)
  return sfdx.source.convert({
    outputdir: directory
  })
}

const getAccessToken = (instance_url, refresh_token) => {
  return request.post(`${instance_url}/services/oauth2/token`, {
    form: {
      client_id: keys.client_id,
      client_secret: keys.client_secret,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }
  }).then(res => {
    return JSON.parse(res).access_token
  })
}

const deployToSandbox = (target, directory, checkOnly, runTests, callback) => new Promise((resolve, reject) => {

  const poll = (jobId, conn) => {
    callback('status', 'success', 'InProgress', 'Polling...')
    setTimeout(() => {
      conn.metadata.checkDeployStatus(jobId, true, (err, result) => {
          if (err) {
            reject(err)
          } else {
            callback('result', null, result.status, result)
            if (result.done) {
              resolve(result)
            } else {
              poll(jobId, conn)
            }
          }
        })
    }, DEPLOY_POLL_INTERVAL)
    
  }

  const startPoll = (jobId) => {
    fs.readFile(`${MAIN_DIRECTORY}/${target}.json`, (err, contents) => {
      if (err) {
        reject(err)
      } else {
        const { refresh_token, instance_url } = JSON.parse(contents.toString())
        getAccessToken(instance_url, refresh_token)
          .then((accessToken) => {
            const conn = new jsforce.Connection({
              instanceUrl: instance_url,
              accessToken,
            })

            poll(jobId, conn)
          })
          .catch(e => reject(e))
      }
    })
  }

  return sfdx.mdapi.deploy({
    checkonly: checkOnly,
    testlevel: runTests ? 'RunLocalTests' : 'NoTestRun',
    targetusername: target,
    deploydir: directory,
    verbose: true
  }).then(data => {
    console.log('Data is', data, 'Target was', target, 'Directtory is', directory)
    callback('status', 'success', 'InProgress', `Metadata uploaded with Job Id ${data.id}`)
    startPoll(data.id)
  }).catch(e => reject(e))
})

module.exports = {
  authDevHub,
  authWithStore,
  createScratchOrg,
  openScratchOrg,
  pushSource,
  getOrgList,
  deleteScratchOrg,
  pullSource,
  openOrg,
  getLimits,
  convertToMDAPI,
  deployToSandbox
}

// reportCommand.run({
//   flags: {
//     jobid: jobId,
//     targetusername: target,
//     json: true
//   }
// }).then(data => {
//   console.log('Data output is', data)
//   if (data) {
//     if (data.result) {
//       console.log('Data result is', data.result)
//       if (data.result.done) {
//         console.log('Data done is', data.result.done)
//         if (data.result.status == 'Failed') {
//           reject(data.result.details.componentFailures)
//         } else {
//           resolve()
//         }
//       } else {
//         poll(jobId)
//       }
//     } else {
//       poll(jobId)
//     }
//   } else {
//     poll(jobId)
//   }
// }).catch(e => {
//   reject(e)
// })
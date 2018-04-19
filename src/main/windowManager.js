const {app, BrowserWindow, ipcMain} = require('electron')

const Settings = require('./settings')
const Storage = require('./storage')
const GitHelper = require('./gitHelper')
const SFDX = require('./sfdx')
const { handleError, logp, log } = require('./utilities')
const fs = require('fs')
const features = require('../../scratch_org_features.json')
const prefs = require('../../scratch_org_preferences.json')
const authoriseTask = require('../main/tasks/authorise')
const Heroku = require('./heroku')

const uuid = require('uuid/v4')
const shell = require('shelljs')
const url = require('url')
const path = require('path')

let scratchOrgWindow
let selectProjectWin
let createFeatureWin
let showPullDifferencesWin

let activeProject

const createWindow = () => 
  new BrowserWindow({
    width: 800, 
    height: 600,
    resizable: false,
    titleBarStyle:'hidden'
  })

const selectScratchOrgDetails = (project) => new Promise((resolve, reject) => {

  const debug = Settings().debugMode

  scratchOrgWindow = createWindow()
  
  scratchOrgWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/createScratchOrg.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    scratchOrgWindow.webContents.openDevTools()
  
  scratchOrgWindow.on('closed', () => {
    reject('Closed')
  })

  ipcMain.once('createScratchOrg.getProjectDetails', (event, options) => {
    event.sender.send('createScratchOrg.projectDetails', {project, features, prefs})
  })

  ipcMain.once('createScratchOrg', (event, options) => {
  
    scratchOrgWindow.hide()
    scratchOrgWindow = null
    resolve(options)
  })
})

const selectProject = () => new Promise((resolve, reject) => {

  const debug = Settings().debugMode

  selectProjectWin = createWindow()
  
  selectProjectWin.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/selectProject.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    selectProjectWin.webContents.openDevTools()
  
  selectProjectWin.on('closed', () => {
    if (!activeProject) {
      reject('No details were provided')
    }
  })
  
  ipcMain.once('setProject', (event, project) => {
    activeProject = project
    selectProjectWin.hide()
    selectProjectWin = null
    GitHelper.openProject(project)
      .then(() => {
        resolve(activeProject)
      })
  })
  
  ipcMain.once('projects', (event, options) => {
    Storage.getProjects()
      .then((projects) => {
        event.sender.send('projects', projects)
      })
  })

  ipcMain.once('createProject.authorise', (event, project) => {
    
    const devHubAlias = `${project.name + 'DevHub'}`
    if (project.repositoryUsername && project.repositoryPassword) {
      // Seperate out protocol, host, etc
      // User url parser
      const {protocol, host, pathname} = new url.URL(project.repositoryURL)

      project.repositoryURL = `${protocol}//${project.repositoryUsername}:${project.repositoryPassword}@${host}${pathname}`
    }

    project.devHubAlias = devHubAlias
    authoriseTask.startAuth(selectProjectWin, devHubAlias)
      .then(() => GitHelper.createProject(project))
      .then(() => Storage.addProject(project))
      .then(() => {
        activeProject = project
        selectProjectWin.hide()
        selectProjectWin = null
        resolve(project)
      })
      .catch(e => reject(e))
  })
})

const createFeature = (project) => new Promise((resolve, reject) => {

  const debug = Settings().debugMode

  createFeatureWin = createWindow()
  
  createFeatureWin.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/createFeature.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    createFeatureWin.webContents.openDevTools()
  
  createFeatureWin.on('closed', () => {
    createFeatureWin.destroy()
    ipcMain.removeAllListeners('createFeature')
    ipcMain.removeAllListeners('createFeature.init')
    createFeatureWin = null
    reject('Closed')
  })

  ipcMain.once('createFeature', (event, options) => {
    createFeatureWin.hide()
    createFeatureWin = null
    resolve(options)
  })

  ipcMain.once('createFeature.init', (event, options) => {
    SFDX.getOrgList(project)
      .then((orgs) => {
        if (createFeatureWin) {
          event.sender.send('createFeature.initResult', {orgs, project, features, prefs })
        }
      })
  })
})

const showPullDifferences = (project, feature, data) => new Promise((resolve, reject) => {
  const debug = Settings().debugMode
  let resolved = false

  showPullDifferencesWin = createWindow()
  
  showPullDifferencesWin.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/pullDifferences.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    showPullDifferencesWin.webContents.openDevTools()
  
  showPullDifferencesWin.on('closed', () => {
    showPullDifferencesWin = null
    if (!resolved) {
      resolve({
        status: 'cancel'
      })
    }
  })

  ipcMain.once('diffs', (event, options) => {
    event.sender.send('diffs', {data, feature, project})
  })

  ipcMain.once('diffResult', (event, result) => {
    showPullDifferencesWin.hide()
    resolved = true
    resolve(result)
  })
})

if (ipcMain) {
  ipcMain.on('getHTMLDiff', (event, data) => {
    if (data) {
      GitHelper.getDiffHTML(data)
        .then(diff => diff ? showHTMLDiff(diff) : null)
        .catch(e => handleError("Couldn't show diff", e))
    }  
  })
  
  ipcMain.on('undoFileChanges', (event, file, project, feature) => {
    if (file) {
      log('Starting undoFileChanges', 'Info', file)
      GitHelper.undoFileChanges(feature.name, file.filePath, file.state)
        .then(() => logp('Finished undoFileChanges', 'Info'))
        .then(() => SFDX.pushSource(project, feature))
        .then(() => logp('Finished pushSource', 'Info'))
        .catch(e => handleError('Could not Undo changes', e))
    }  
  })
}

const showHTMLDiff = (diff) => {
  const debug = Settings().debugMode
  let diffWindow = createWindow()

  if (debug)
    diffWindow.webContents.openDevTools()

  diffWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/showDiff.html'),
    protocol: 'file:',
    slashes: true
  }))

  ipcMain.once('getDiff', (event, options) => {
    event.sender.send('diff', diff)
  })

  diffWindow.on('closed', () => {
    diffWindow = null
  })
}

const createBasicWindow = () => {
  const debug = Settings().debugMode
  let win = createWindow()

  if (debug)
    win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })

  return win
}

const connectSandbox = (project) => new Promise((resolve, reject) => {

  log('In windowManager.connectSandbox', 'Info')

  const debug = Settings().debugMode
  let connectSandboxWindow = createWindow()

  if (debug)
    connectSandboxWindow.webContents.openDevTools()

  connectSandboxWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/connectSandbox.html'),
    protocol: 'file:',
    slashes: true
  }))

  ipcMain.once('connectSandbox.connectSandbox', (event, sandbox) => {
    
    log(`In windowManager.connectSandbox event triggered connectSandbox.connectSandbox with params ${JSON.stringify(sandbox)}`, 'Info')

    sandbox.alias = `${project.name}_${sandbox.name}`

    authoriseTask.startAuth(connectSandboxWindow, sandbox.alias, sandbox.instanceURL)
      .then(() => Storage.getProject(project))
      .then(project => {
        log(`In windowManager.connectSandbox updating storage for project ${project.name}`, 'Info')
        if (!project.sandboxes) {
          project.sandboxes = []
        }
        
        project.sandboxes.push(sandbox)
        return Storage.updateProject(project)
      })
      .then(() => {
        log(`In windowManager.connectSandbox finished updating storage for project ${project.name}`, 'Info')
        connectSandboxWindow.hide()
        connectSandboxWindow = null
        resolve()
      })
      .catch(e => reject(e))
  })

  connectSandboxWindow.on('closed', () => {
    connectSandboxWindow = null
    reject('Closed')
  })
})

const showLimits = (alias) => new Promise ((resolve, reject) => {
  const debug = Settings().debugMode
  let win = createWindow()

  if (debug)
    win.webContents.openDevTools()

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/showLimits.html'),
    protocol: 'file:',
    slashes: true
  }))

  ipcMain.once('showLimits.allLimits', (event) => {
    SFDX.getLimits(alias)
      .then((values) => {
        log(`WindowManager.showLimits result of SFDX.getLimits for ${alias} is ${JSON.stringify(values)}`, 'Info')
        if (win) {
          event.sender.send('showLimits.allLimits.response', values)
        }
      })
  })

  ipcMain.once('showLimits.close', (event, options) => {
    log(`WindowManager.showLimits close event`, 'Info')
    win.hide()
    win = null
    resolve()
  })

  win.on('closed', () => {
    win = null
    resolve()
  })
})

const deployToSandbox = (project, sandbox) => new Promise ((resolve, reject) => {
  const debug = Settings().debugMode
  let win = createWindow()

  if (debug)
    win.webContents.openDevTools()

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/deployToSandbox.html'),
    protocol: 'file:',
    slashes: true
  }))

  const deployDirectoryName =`${project.directory}/mdapi_${uuid()}`

  const deleteDeployDir = () => {
    log(`WindowManager.deployToSandbox Deploy Directory ${deployDirectoryName} starting delete`, 'Info')
    if (fs.existsSync(deployDirectoryName)) {
      shell.rm('-rf', deployDirectoryName)
      log(`WindowManager.deployToSandbox Deploy Directory ${deployDirectoryName} deleted`, 'Info')
    }
  }

  ipcMain.once('deployToSandbox.getInitData', (event) => {
    log(`WindowManager.deployToSandbox init data method called`, 'Info')
    GitHelper.getRemoteBranches()
      .then(branches => {
        log(`WindowManager.deployToSandbox deployToSandbox.getInitData complete branches ${branches}`, 'Info')
        if (win) {
          event.sender.send('deployToSandbox.getInitData.response', { sandbox, branches })
        }
      })
  })

  ipcMain.on('deployToSandbox.deploy', (event, {branch, checkOnly, runTests}) => {

    const logSend = (type, text) => {
      log(`WindowManager.deployToSandbox deployToSandbox.deploy - Deploy to ${sandbox.alias} - ${text}`, type)
      if (win) {
        event.sender.send('deployToSandbox.deploy.log', {
          type,
          text
        })
      }
    }

    const resultSend = (result) => {
      log(`WindowManager.deployToSandbox deployToSandbox.deploy - Deploy to ${sandbox.alias} RESULT - ${JSON.stringify(result)}`, 'Info')
      if (win) {
        event.sender.send('deployToSandbox.deploy.result', result)
      }
    }

    log(`WindowManager.deployToSandbox deployToSandbox.deploy event invoked for ${sandbox.alias}`, 'Info')
    GitHelper.switchBranch(branch)
      .then(() => {
        logSend('success', `Got remote branch ${branch}`)

        deleteDeployDir()
        fs.mkdirSync(deployDirectoryName)

        return SFDX.convertToMDAPI(project.directory, deployDirectoryName)
      })
      .then(() => {
        logSend('success', `Finished converting source`)

        return SFDX.deployToSandbox(sandbox.alias, deployDirectoryName, checkOnly, runTests, (type, logType, status, data) => {
          if (type === 'status') {
            logSend(logType, data)
          } else {
            resultSend(data)
          }
        })
      })
      .then(data => {
        deleteDeployDir()
        if (data.details) {
          if (data.details.componentFailures) {
            logSend('error', `Deploy Completed with Errors`)    
          } else {
            logSend('success', `Deploy Completed successfully`)    
          }
        } else {
          logSend('neutral', `Deploy Completed [Unknown Status]`)
        }
      })
      .catch(e => {
        deleteDeployDir()
        logSend('error', `Deploy Failed with the error - ${e.toString()}`)
      })
  })

  win.on('closed', () => {
    win = null
    resolve()
  })
})

const createHerokuPipeline = (project) => new Promise((resolve, reject) => {

  const debug = Settings().debugMode
  let win = createWindow()

  if (debug)
    win.webContents.openDevTools()

    Heroku.startAuth(win, project)
      .then(authResponse => {
        project['heroku_refresh_token'] = authResponse.refresh_token
        Storage.updateProject(project)
          .then(() => {
            return Heroku.getRegions(authResponse.access_token)
          })
      })
      .then(regions => {
        console.log('Regions', regions)
        resolve()
      })
      .catch(e => reject(e))
  // win.loadURL(url.format({
  //   pathname: path.join(__dirname, '../../views/createHerokuPipeline.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  win.on('closed', () => {
    win = null
    resolve()
  })
})



module.exports = {
  selectScratchOrgDetails,
  selectProject,
  createFeature,
  showPullDifferences,
  createBasicWindow,
  connectSandbox,
  showLimits,
  deployToSandbox,
  createHerokuPipeline
}
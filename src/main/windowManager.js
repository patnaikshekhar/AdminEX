const {BrowserWindow, ipcMain} = require('electron')

const Settings = require('./settings')
const Storage = require('./storage')
const GitHelper = require('./gitHelper')
const SFDX = require('./sfdx')

const url = require('url')
const path = require('path')

let scratchOrgWindow
let selectProjectWin
let createFeatureWin
let showPullDifferencesWin

let activeProject

const selectScratchOrgDetails = () => new Promise((resolve, reject) => {

  const debug = Settings().debugMode

  scratchOrgWindow = new BrowserWindow({width: 800, height: 600})
  
  scratchOrgWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/createScratchOrg.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    scratchOrgWindow.webContents.openDevTools()
  
  scratchOrgWindow.on('closed', () => {
  })

  ipcMain.once('createScratchOrg', (event, options) => {
  
    scratchOrgWindow.hide()
    scratchOrgWindow = null
    resolve(options)
  })
})

const selectProject = () => new Promise((resolve, reject) => {

  const debug = Settings().debugMode

  selectProjectWin = new BrowserWindow({width: 800, height: 600})
  
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

  ipcMain.once('createProject', (event, project) => {
    GitHelper.createProject(project)
      .then(() => Storage.addProject(project))
      .then(data => {
        activeProject = data.projects[data.projects.length - 1]
        selectProjectWin.hide()
        selectProjectWin = null
        resolve(activeProject)
      })
      .catch((e) => console.error(e))
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
})

const createFeature = (project) => new Promise((resolve, reject) => {

  const debug = Settings().debugMode

  createFeatureWin = new BrowserWindow({width: 800, height: 600})
  
  createFeatureWin.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/createFeature.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    createFeatureWin.webContents.openDevTools()
  
  createFeatureWin.on('closed', () => {
    createFeatureWin = null
  })

  ipcMain.once('createFeature', (event, options) => {
    createFeatureWin.hide()
    createFeatureWin = null
    resolve(options)
  })

  ipcMain.once('getScratchOrgs', (event, options) => {
    SFDX.getOrgList(project)
      .then((orgs) => {
        event.sender.send('orgs', orgs)
      })
  })
})

/*
[{"state":"Changed","fullName":"Account.Test1__c","type":"CustomField","filePath":"force-app/main/default/objects/Account/fields/Test1__c.field-meta.xml"}]
*/
const showPullDifferences = (project, data) => new Promise((resolve, reject) => {
  const debug = Settings().debugMode

  showPullDifferencesWin = new BrowserWindow({width: 800, height: 600})
  
  showPullDifferencesWin.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/pullDifferences.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    showPullDifferencesWin.webContents.openDevTools()
  
  showPullDifferencesWin.on('closed', () => {
    showPullDifferencesWin = null
    resolve({
      action: 'Cancel'
    })
  })

  ipcMain.once('diffs', (event, options) => {
    event.sender.send('diffs', {data, project})
  })

  ipcMain.once('diffResult', (event, result) => {
    showPullDifferencesWin.hide()
    showPullDifferencesWin = null
    resolve(result)
  })
})

module.exports = {
  selectScratchOrgDetails,
  selectProject,
  createFeature,
  showPullDifferences
}
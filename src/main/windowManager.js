const {BrowserWindow, ipcMain} = require('electron')

const Settings = require('./settings')
const Storage = require('./storage')
const GitHelper = require('./gitHelper')

const url = require('url')
const path = require('path')

let scratchOrgWindow
let selectProjectWin
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

module.exports = {
  selectScratchOrgDetails,
  selectProject
}
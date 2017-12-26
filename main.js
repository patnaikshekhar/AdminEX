const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const gitHelper = require('./src/main/gitHelper')
const Storage = require('./src/main/storage')
const TrayHelper = require('./src/main/trayHelper')

let win
let activeProject

const createProjectWindow = () => {
  win = new BrowserWindow({width: 800, height: 600})
  
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'views', 'selectProject.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.webContents.openDevTools()
  
  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createProjectWindow)

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createProjectWindow()
  }
})

ipcMain.on('createProject', (event, options) => {
  const {directory, repositoryURL} = options
  gitHelper.createProject(directory, repositoryURL)
    .then(() => Storage.addProject(options))
    .then((data) => {
      activeProject = data.projects[data.projects.length - 1]
      win.hide()
      TrayHelper.setupTray(activeProject)
    })
    .catch((e) => console.error(e))
})

ipcMain.on('setProject', (event, project) => {
  activeProject = project
  win.hide()
  TrayHelper.setupTray(activeProject)
})

ipcMain.on('projects', (event, options) => {
  Storage.getProjects()
    .then((projects) => {
      event.sender.send('projects', projects)
    })
})
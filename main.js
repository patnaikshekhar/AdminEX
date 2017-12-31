const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const TrayHelper = require('./src/main/trayHelper')
const WindowManager = require('./src/main/windowManager')
const {handleError} = require('./src/main/utilities')

app.on('ready', () => {
  WindowManager.selectProject()
    .then(project => TrayHelper.setupTray(project))
    .catch(e => {
      handleError('Could not generate project', e)
      app.quit()
    })
})

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

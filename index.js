const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const path = require('path')
const url = require('url')
const TrayHelper = require('./src/main/trayHelper')
const WindowManager = require('./src/main/windowManager')
const {handleError} = require('./src/main/utilities')
const Utilities = require('./src/main/utilities')

Utilities.checkAppMainDirectory()

app.on('ready', () => {
  var template = [{
    label: "Application",
    submenu: [
        { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
  ];
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  
  WindowManager.selectProject()
    .then(project => TrayHelper.setupTray(project))
    .catch(e => {
      console.log(e)
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



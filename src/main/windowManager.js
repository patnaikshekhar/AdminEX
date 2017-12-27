const {BrowserWindow, ipcMain} = require('electron')
const url = require('url')
const path = require('path')

let scratchOrgWindow
let debug = true

const selectScratchOrgDetails = () => new Promise((resolve, reject) => {
  scratchOrgWindow = new BrowserWindow({width: 800, height: 600})
  
  scratchOrgWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../views/createScratchOrg.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (debug)
    scratchOrgWindow.webContents.openDevTools()
  
  scratchOrgWindow.on('closed', () => {
    scratchOrgWindow = null
    reject('No details were provided')
  })

  ipcMain.once('createScratchOrg', (event, options) => {
    scratchOrgWindow.hide()
    scratchOrgWindow = null
    resolve(options)
  })
})

module.exports = {
  selectScratchOrgDetails
}
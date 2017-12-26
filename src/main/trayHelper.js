const {Tray, Menu} = require('electron')
const sfdx = require('./sfdx')
const Storage = require('./Storage')
const {handleError} = require('./utilities')

let tray = null

const setupTray = (project) => {
  console.log(`${__dirname}/assets/icons/tray_icon.png`)
  tray = new Tray(`${__dirname}/../../assets/icons/tray_icon.png`)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Connect Dev Hub',
      type: undefined,
      click: () => sfdx.authDevHub(project)
        .then((alias) => {
          project.devHubAlias = alias
          return Storage.updateProject(project)
        })
        .catch((e) => handleError(e))
    },
    {
      label: 'Create Scratch Org',
      type: undefined
    },
    {
      type: 'separator',
      label: undefined
    },
    {
      label: 'Start Feature',
      type: undefined
    },
    {
      label: 'Pull from Scratch Org',
      type: undefined
    }
  ])

  tray.setContextMenu(contextMenu)
}

module.exports = {
  setupTray
}
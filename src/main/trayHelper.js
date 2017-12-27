const {app, Tray, Menu} = require('electron')
const sfdx = require('./sfdx')
const Storage = require('./Storage')
const {handleError, alert} = require('./utilities')
const WindowManager = require('./windowManager')

let tray = null

const setupTray = (project) => {
  tray = new Tray(`${__dirname}/../../assets/icons/tray_icon.png`)
  refreshMenu(project)
}

const refreshMenu = (project) => {
  createContextMenu(project)
    .then(menu => Menu.buildFromTemplate(menu))
    .then(contextMenu => tray.setContextMenu(contextMenu))
    .catch(e => handleError(e))
}

const getConnectToDevOrgItem = (project) => new Promise((resolve, reject) => {
  if (project.devHubAlias) {
    resolve([])
  } else {
    resolve([{
      label: 'Connect Dev Hub',
      type: undefined,
      click: () => sfdx.authDevHub(project)
        .then((alias) => {
          project.devHubAlias = alias
          return Storage.updateProject(project)
        })
        .then(() => alert('Dev Hub Org Added'))
        .catch((e) => handleError(e))
    }])
  }
})

const getScratchOrgItems = (project) => 
  sfdx.getOrgList(project)
    .then((orgs) => {
      const items = [{
        label: 'Create Scratch Org',
        type: undefined,
        click: () => 
          WindowManager.selectScratchOrgDetails()
            .then(options => sfdx.createScratchOrg(project, options))
            .then(options => sfdx.pushSource(options))
            .then(options => sfdx.openScratchOrg(options))
            .then(options => alert(`${options.alias} is now ready`))
            .catch((e) => handleError(e))
      }]
      
      if (orgs.length > 0) {
        return items.concat({
          label: 'Open',
          submenu: orgs.map((alias => ({
            label: alias,
            click: () => 
              sfdx.openScratchOrg({ alias })
          })))
        })
      } else {
        return items
      }
    })

const getFeatureItems = (project) => new Promise((resolve, reject) => {
  resolve([{
    label: 'Start Feature',
    type: undefined
  },
  {
    label: 'Pull from Scratch Org',
    type: undefined
  }])
})

const getQuitItem = () => new Promise((resolve, reject) => {
  resolve({
    label: 'Quit',
    type: undefined,
    click: () => app.quit()
  })
})

const seperator = () => new Promise((resolve, reject) => resolve([{
  type: 'separator',
  label: undefined
}]))

const createContextMenu = (project) => {
  const template = [
    getConnectToDevOrgItem(project), seperator(), 
    getScratchOrgItems(project), seperator(),
    getFeatureItems(project), seperator(),
    getQuitItem()]

  return Promise.all(template)
          .then((items) => items.reduce((acc, item) => item ? acc.concat(item) : acc, []))
}

module.exports = {
  setupTray
}
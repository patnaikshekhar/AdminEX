const {app, Tray, Menu} = require('electron')
const sfdx = require('./sfdx')
const Storage = require('./Storage')
const {handleError, alert, log} = require('./utilities')
const WindowManager = require('./windowManager')

let tray = null

const setupTray = (project) => {
  tray = new Tray(`${__dirname}/../../assets/icons/tray_icon.png`)
  refreshMenu(project)
    .catch(e => handleError('Could not generate project', e))
}

const refreshMenu = (project, options) => 
  createContextMenu(project)
    .then(menu => Menu.buildFromTemplate(menu))
    .then(contextMenu => tray.setContextMenu(contextMenu))
    .then(() => options)
    .catch(e => handleError('Could not generate project', e))

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
        .catch(e => handleError('Could not connect to DevHub', e))
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
            .then((options) => { log('Finished createScratchOrg', 'Info'); return options })
            .then(options => sfdx.pushSource(project, options))
            .then((options) => { log('Finished pushSource', 'Info'); return options })
            // .then(options => sfdx.openScratchOrg(options))
            // .then((options) => { log('Finished openScratchOrg'); return options })
            .then(options => refreshMenu(project, options))
            .then((options) => { log('Finished refreshMenu', 'Info'); return options })
            .then(options => alert(`${options.alias} is now ready`))
            .catch(e => handleError('Error creating scratch org', e))
      }]

      if (orgs.length > 0) {
        return items.concat({
          label: 'Open Org',
          submenu: orgs.map((alias => ({
            label: alias,
            click: () => 
              sfdx.openScratchOrg({ alias })
              .catch(e => handleError('Error creating scratch org', e))
          })))
        }, {
          label: 'Delete Org',
          submenu: orgs.map((alias => ({
            label: alias,
            click: () => 
              sfdx.deleteScratchOrg({ alias })
                  .then(() => refreshMenu(project))
                  .catch(e => handleError('Delete Org Failed', e))
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
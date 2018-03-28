const {app, Tray, Menu} = require('electron')
const sfdx = require('./sfdx')
const Storage = require('./storage')
const {handleError, alert, log, logp} = require('./utilities')
const WindowManager = require('./windowManager')
const GitHelper = require('./gitHelper')
const createScratchOrg = require('./tasks/createScratchOrg')
const openScratchOrg = require('./tasks/openScratchOrg')
const deleteScratchOrg = require('./tasks/deleteScratchOrg')
const authDevHub = require('./tasks/authDevHub')
const createWork = require('./tasks/createWork')
const startWork = require('./tasks/startWork')
const deleteWork = require('./tasks/deleteWork')
const pullChanges = require('./tasks/pullChanges')
const open = require('./tasks/open')

let tray = null

const setupTray = (project) => {
  if (!tray) {
    tray = new Tray(`${__dirname}/../../assets/icons/dxicon_tray.png`)
  }
  
  refreshMenu(project)
    .catch(e => handleError('Could not generate project', e))
}

const refreshMenu = (project, options) => 
  Storage.getProject(project)
    .then(project => createContextMenu(project))
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
      click() { 
        authDevHub(project)
          .catch(e => handleError('Could not connect to DevHub', e))
      }
    }])
  }
})

const getScratchOrgItems = (project) => {
  if (project.devHubAlias) {
    return sfdx.getOrgList(project)
      .then((orgs) => {
        const items = [{
          label: 'Create Scratch Org',
          type: undefined,
          click() { 
            createScratchOrg(project, refreshMenu)
              .catch(e => handleError('Error creating scratch org', e))
          }
        }]

        if (orgs.length > 0) {
          return items.concat({
            label: 'Open Org',
            submenu: orgs.map((alias => ({
              label: alias,
              click() {
                openScratchOrg(alias)
                  .catch(e => handleError('Error creating scratch org', e))
              }
            })))
          }, {
            label: 'Delete Org',
            submenu: orgs.map((alias => ({
              label: alias,
              click: () => 
                deleteScratchOrg(alias, project, refreshMenu)
                  .catch(e => handleError('Delete Org Failed', e))
            })))
          })
        } else {
          return items
        }
      })
  } else {
    return new Promise((resolve, reject) => resolve([]))
  }
}   

const getStartFeature = (project) => new Promise((resolve, reject) => {
  if (project.devHubAlias) {
    resolve([{
      label: 'New Work',
      type: undefined,
      click() {
        createWork(project, refreshMenu)
          .catch(e => handleError('Error creating feature', e))
      }
    }])
  } else {
    resolve([])
  }
})

const getFeatures = (project) => new Promise((resolve, reject) => {
  if (project.features && project.devHubAlias) {
    resolve(project.features.map(feature => ({
      label: feature.name,
      type: undefined,
      submenu: [
        {
          label: 'Start Work',
          type: undefined,
          click() {
            log(`Start work for feature ${feature.name}`, 'Info')
            startWork(feature)
              .catch(e => handleError(e))
          }
        },
        {
          label: 'Pull Changes from Scratch Org',
          type: undefined,
          click() {
            log(`Pull Changes for feature ${feature.name}`, 'Info')
            pullChanges(project, feature)
              .catch(e => handleError('Pull Changes from Scratch Org Failed', e))
          }
        },
        {
          label: 'Delete',
          type: undefined,
          click() {
            deleteWork(project, feature, refreshMenu)
              .catch(e => handleError('Delete Org Failed', e))
          }
        }
      ]
    })))
  } else {
    resolve([])
  }
})

const getQuitItem = () => new Promise((resolve, reject) => {
  resolve({
    label: 'Quit',
    type: undefined,
    click() { 
      app.quit() 
    }
  })
})

const seperator = () => new Promise((resolve, reject) => resolve([{
  type: 'separator',
  label: undefined
}]))

const getOpenItems = (project) => new Promise((resolve, reject) => {
  resolve([
    {
      label: 'Open Project Folder',
      type: undefined,
      click() { 
        open.openRepositoryFolder(project)
          .catch(e => handleError(e))
      }
    }, {
      label: 'Open Repository',
      type: undefined,
      click() { 
        open.openRepositoryURL(project)
          .catch(e => handleError(e))
      }
    }, {
      label: 'Reconnect DevHub',
      type: undefined,
      click() { 
        sfdx.authDevHub(project)
          .catch(e => handleError(e))
      }
    }, {
      label: 'Switch Project',
      type: undefined,
      click() { 
        WindowManager.selectProject()
          .then(project => setupTray(project))
          .catch(e => {
            log('Error in switch project', e)
            app.quit()
          })
      }
    }
  ])
})

const createContextMenu = (project) => {
  const template = [
    getConnectToDevOrgItem(project), seperator(), 
    getStartFeature(project), getFeatures(project), seperator(),
    getScratchOrgItems(project), seperator(),
    getOpenItems(project), seperator(),
    getQuitItem()]

  return Promise.all(template)
          .then(items => items.reduce((acc, item) => {
            if (acc.length > 0) {
              if (acc[acc.length - 1].type == 'separator' && item.type == 'separator') {
                return acc
              }
            }
            
            return item ? acc.concat(item) : acc
          }, []))
}

module.exports = {
  setupTray
}
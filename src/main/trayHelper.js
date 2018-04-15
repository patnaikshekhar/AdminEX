const {app, Tray, Menu, dialog} = require('electron')
const sfdx = require('./sfdx')
const Storage = require('./storage')
const {handleError, alert, log, logp} = require('./utilities')
const WindowManager = require('./windowManager')
const GitHelper = require('./gitHelper')
const createScratchOrg = require('./tasks/createScratchOrg')
const openOrg = require('./tasks/openOrg')
const deleteScratchOrg = require('./tasks/deleteScratchOrg')
const authDevHub = require('./tasks/authDevHub')
const createWork = require('./tasks/createWork')
const startWork = require('./tasks/startWork')
const deleteWork = require('./tasks/deleteWork')
const pullChanges = require('./tasks/pullChanges')
const open = require('./tasks/open')
const authTask = require('./tasks/authorise')
const removeSandboxOrg = require('./tasks/removeSandboxOrg')
const MAIN_ICON = `${__dirname}/../../assets/icons/dxicon_tray.png`

let tray = null
let loading = false
let loadingIndicatorNumber = 0

const setupTray = (project) => {
  if (!tray) {
    tray = new Tray(MAIN_ICON)
  }
  
  refreshMenu(project)
    .catch(e => handleError('Could not generate project', e))
}

const refreshMenu = (project, options) => {
  log(`trayHelper.refreshMenu started`, 'Info')
  return Storage.getProject(project)
    .then(project => createContextMenu(project))
    .then(menu => Menu.buildFromTemplate(menu))
    .then(contextMenu => tray.setContextMenu(contextMenu))
    .then(() => options)
    .then(() => logp(`trayHelper.refreshMenu finished`, 'Info', options))
    .catch(e => handleError('Could not generate project', e))
}
  
const startLoading = () => {
  loading = true

  const loadingLoop = () => {
    loadingIndicatorNumber += 1
    if (loadingIndicatorNumber > 3) {
      loadingIndicatorNumber = 1
    }

    tray.setImage(`${__dirname}/../../assets/icons/bubbles${loadingIndicatorNumber}.png`)

    if (loading) {
      setTimeout(() => {
        loadingLoop()
      }, 500)
    } else {
      loadingIndicatorNumber = 0
      tray.setImage(MAIN_ICON)  
    }
  }
  
  loadingLoop()
}

const stopLoading = () => {
  loading = false
  loadingIndicatorNumber = 0
  tray.setImage(MAIN_ICON)
}

const getDevHubItems = (project) => new Promise((resolve, reject) => {
  resolve([{
    label: 'Dev Hub',
    type: undefined,
    submenu: [{
      label: 'Reconnect',
      type: undefined,
      click() { 
        log(`Reconnect DevHub Task started`, 'Info')
        let win = WindowManager.createBasicWindow()
        authTask.startAuth(win, project.devHubAlias)
          .then(() => {
            win.hide()
            win = null
          })
          .catch(e => handleError(`Error in Reconnect Dev Hub Task started`, e))
      }
    }, {
      label: 'Open',
      type: undefined,
      click() { 
        log(`Open Devhub Task started`, 'Info')
        openOrg(project.devHubAlias)
          .catch(e => handleError('Error in Open Devhub Task', e))
      }
    }, {
      label: 'Limits',
      type: undefined,
      click() { 
        log(`Show Limits Task started`, 'Info')
        startLoading()
        WindowManager.showLimits(project.devHubAlias)
          .then(() => stopLoading())
          .catch(e => {
            stopLoading()
            handleError('Error in Show Limits Task', e) 
          })
      }
    }]
  }])
})

const getScratchOrgItems = (project) => {
  if (project.devHubAlias) {
    return sfdx.getOrgList(project)
      .then((orgs) => {
        const items = [{
          label: 'Create Scratch Org',
          type: undefined,
          click() { 
            startLoading()
            createScratchOrg(project, refreshMenu)
              .then(() => stopLoading())
              .catch(e => { 
                stopLoading(); 
                if (e !== 'Closed')
                  handleError('Error creating scratch org', e) 
              })
          }
        }]

        if (orgs.length > 0) {
          return items.concat({
            label: 'Open Org',
            submenu: orgs.map((alias => ({
              label: alias,
              click() {
                startLoading()
                openOrg(alias)
                  .then(() => stopLoading())
                  .catch(e => { stopLoading(); handleError('Error creating scratch org', e) })
              }
            })))
          }, {
            label: 'Delete Org',
            submenu: orgs.map((alias => ({
              label: alias,
              click: () => {
                startLoading()
                deleteScratchOrg(alias, project, refreshMenu)
                  .then(() => stopLoading())
                  .catch(e => { stopLoading(); handleError('Delete Org Failed', e) })
              }
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
        startLoading()
        createWork(project, refreshMenu)
          .then(() => stopLoading())
          .catch(e => { 
            stopLoading()
            if (e !== 'Closed') {
              handleError('Error creating feature', e) 
            }
          })
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
            startLoading()
            startWork(feature)
              .then(() => stopLoading())
              .catch(e => { stopLoading(); handleError('Error creating feature', e) })
          }
        },
        {
          label: 'Pull Changes from Scratch Org',
          type: undefined,
          click() {
            log(`Pull Changes for feature ${feature.name}`, 'Info')
            startLoading()
            pullChanges(project, feature)
              .then(() => stopLoading())
              .catch(e => { stopLoading(); handleError('Pull Changes from Scratch Org Failed', e) })
          }
        },
        {
          label: 'Scratch Org Limits',
          type: undefined,
          click() { 
            log(`Show Limits Task started`, 'Info')
            startLoading()
            WindowManager.showLimits(feature.scratchOrg)
              .then(() => stopLoading())
              .catch(e => {
                stopLoading()
                handleError('Error in Show Limits Task', e) 
              })
          }
        },
        {
          label: 'Delete',
          type: undefined,
          click() {
            startLoading()
            deleteWork(project, feature, refreshMenu)
              .then(() => stopLoading())
              .catch(e => { stopLoading(); handleError('Delete Org Failed', e) })
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

const getAllSandboxes = (project) => new Promise((resolve, reject) => {
  let connectItem = [
    {
      label: 'Connect Sandbox',
      type: undefined,
      click() { 
        log(`Connect Sandbox Task started`, 'Info')
        startLoading()
        WindowManager.connectSandbox(project)
          .then(() => refreshMenu(project))
          .then(() => stopLoading())
          .catch(e => { 
            stopLoading(); 
            if (e !== 'Closed') {
              handleError('Error connecting sandbox', e) 
            }
          })
      }
    }
  ]

  let sandboxItems = []

  if (project.sandboxes) {
    sandboxItems = project.sandboxes.map(sandbox => ({
      label: sandbox.name,
      type: undefined,
      submenu: [
        {
          label: 'Open',
          type: undefined,
          click() {
            log(`Open Sandbox Org started`, 'Info')
            startLoading()
            openOrg(sandbox.alias)
              .then(() => stopLoading())
              .catch(e => { stopLoading(); handleError('Error opening sandbox', e) })
          }
        },
        {
          label: 'Remove from Project',
          type: undefined,
          click() {
            log(`Remove Sandbox Org started`, 'Info')
            startLoading()
            removeSandboxOrg(project, sandbox.alias)
              .then(() => refreshMenu(project))
              .then(() => stopLoading())
              .catch(e => { stopLoading(); handleError('Error opening sandbox', e) })
          }
        }, {
          label: 'Limits',
          type: undefined,
          click() { 
            log(`Show Limits Task started`, 'Info')
            startLoading()
            WindowManager.showLimits(sandbox.alias)
              .then(() => stopLoading())
              .catch(e => {
                stopLoading()
                handleError('Error in Show Limits Task', e) 
              })
          }
        }, {
          label: 'Deploy',
          type: undefined,
          click() {
            log(`Deploy to Sandbox Task started for sandbox - ${sandbox.alias}`, 'Info')
            startLoading()
            WindowManager.deployToSandbox(project, sandbox)
              .then(() => stopLoading())
              .catch(e => {
                stopLoading()
                handleError('Error in Deploy to Sandbox Task', e) 
              })
          }
        }
      ]
    }))
  }

  resolve(connectItem.concat(sandboxItems))
})

const createContextMenu = (project) => {
  const template = [
    getDevHubItems(project), seperator(), 
    getStartFeature(project), getFeatures(project), seperator(),
    getScratchOrgItems(project), seperator(),
    getAllSandboxes(project), seperator(),
    getOpenItems(project), seperator(),
    getQuitItem()]
  
  startLoading()

  return Promise.all(template)
          .then(items => items.reduce((acc, item) => {
            if (acc.length > 0) {
              if (acc[acc.length - 1].type == 'separator' && item.type == 'separator') {
                return acc
              }
            }
            
            return item ? acc.concat(item) : acc
          }, []))
          .then((data) => { 
            stopLoading() 
            return data
          })
}

module.exports = {
  setupTray
}
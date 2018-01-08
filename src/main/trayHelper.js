const {app, Tray, Menu} = require('electron')
const sfdx = require('./sfdx')
const Storage = require('./storage')
const {handleError, alert, log, logp} = require('./utilities')
const WindowManager = require('./windowManager')
const GitHelper = require('./gitHelper')

let tray = null
let activeFeature

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
        sfdx.authDevHub(project)
          .then((alias) => {
            project.devHubAlias = alias
            return Storage.updateProject(project)
          })
          // .then(() => refreshMenu(project))
          .then(() => alert('Dev Hub Org Added. Relaunching application.'))
          .then(() => {
            app.relaunch()
            app.exit()
          })
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
            WindowManager.selectScratchOrgDetails()
              .then(options => sfdx.createScratchOrg(project, options))
              .then(options => { log('Finished createScratchOrg', 'Info'); return options })
              .then(options => sfdx.pushSource(project, options))
              .then(options => { log('Finished pushSource', 'Info'); return options })
              .then(options => sfdx.openScratchOrg(options))
              .then(options => { log('Finished openScratchOrg', 'Info'); return options })
              .then(options => refreshMenu(project, options))
              .then(options => { log('Finished refreshMenu', 'Info'); return options })
              .then(options => alert(`${options.alias} is now ready`))
              .catch(e => handleError('Error creating scratch org', e))
          }
        }]

        if (orgs.length > 0) {
          return items.concat({
            label: 'Open Org',
            submenu: orgs.map((alias => ({
              label: alias,
              click() {
                sfdx.openScratchOrg({ alias })
                  .then(options => { log('Finished openScratchOrg', 'Info'); return options })
                  .catch(e => handleError('Error creating scratch org', e))
              }
            })))
          }, {
            label: 'Delete Org',
            submenu: orgs.map((alias => ({
              label: alias,
              click: () => 
                sfdx.deleteScratchOrg({ alias })
                    .then(options => { log('Finished deleteScratchOrg', 'Info'); return options })
                    .then(() => refreshMenu(project))
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
        WindowManager.createFeature(project)
          .then(feature => logp(`New Work for ${JSON.stringify(feature)}`, 'Info', feature))
          .then(feature => {
            if (!feature.existingOrg) {
              feature.scratchOrg = feature.name
            } else {
              feature.scratchOrg = feature.existingOrg
            }

            return feature
          })
          .then(feature => 
              Storage.getProject(project)
                .then(project => {
                  if (project.features) {
                    return Object.assign(project, { features: project.features.concat(feature) })
                  } else {
                    return Object.assign(project, { features: [feature] })
                  }
                })
                .then(updatedProject => {
                  project = updatedProject
                  return Storage.updateProject(project)
                })
                .then(() => activeFeature = feature.name)
                .then(() => 
                  GitHelper.createFeatureBranch(feature.name)
                    .then(() => logp(`Finished creating feature branch for ${feature.name}`, 'Info'))
                    .then(() => {
                      if (!feature.existingOrg) {
                        return sfdx.createScratchOrg(project, {
                          location: feature.location, 
                          alias: feature.scratchOrg
                        }).then(options => logp(`Finished createScratchOrg ${JSON.stringify(options)}`, 'Info', options))
                      } else {
                        log(`Returning existing org for ${feature.name}`, 'Info')
                        return {
                          alias: feature.scratchOrg  
                        }
                      }
                    })
                    .then(options => sfdx.pushSource(project, options))
                    .then(options => logp('Finished pushSource', 'Info', options))
                    .then(options => sfdx.openScratchOrg(options))
                    .then(options => logp('Finished openScratchOrg', 'Info', options))
                    .then(options => refreshMenu(project, options))
                    .then(options => logp('Finished refreshMenu', 'Info', options)))
                    .then(() => alert(`${feature.name} is now ready`)))
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
      label: `${feature.name} ${activeFeature == feature.name ? '(Active)' : ''}`,
      type: undefined,
      submenu: [
        {
          label: 'Start Work',
          type: undefined,
          click() {
            activeFeature = feature.name
            log(`Start work for feature ${feature.name}`, 'Info')
            GitHelper.switchBranch(feature.name)
              .then(() => sfdx.openScratchOrg({ alias: feature.scratchOrg }))
              .catch(e => handleError(e))
          }
        },
        {
          label: 'Commit Changes from Scratch Org',
          type: undefined,
          click() {
            activeFeature = feature.name
            log(`Pull Changes for feature ${feature.name}`, 'Info')
            GitHelper.switchBranch(feature.name)
              .then(() => sfdx.pullSource(project, { alias: feature.scratchOrg }))
              .then(data => logp(`Data from pull`, 'Info', data))
              .then(data => 
                WindowManager.showPullDifferences(project, feature, data)
                  .then(message => logp(`Commiting for ${feature.name}`, 'Info', message))
                  .then(message => {
                    if (data) {
                      if (data.length > 0) {
                        return GitHelper.addCommitAndPush(feature.name, message)
                      } else {
                        return logp(`Nothing to commit `, 'Info', data)
                      }
                    }
                  }))
              .catch(e => handleError('Pull Changes from Scratch Org Failed', e))
          }
        },
        {
          label: 'Delete',
          type: undefined,
          click() {
            Storage.getProject(project)
              // .then(project => { console.log(project); return project; })
              .then(project => Object.assign(project, {
                features: project.features.filter(f => f.name != feature.name)
              }))
              .then(project => Storage.updateProject(project))
              .then(() => GitHelper.deleteBranch(feature.name))
              .then(() => { log('Finished deleteBranch', 'Info') })
              .then(() => sfdx.deleteScratchOrg({ alias: feature.scratchOrg }))
              .then(() => { log('Finished deleteScratchOrg', 'Info') })
              .then(() => refreshMenu(project))
              .then(() => alert(`Finished deleting ${feature.name}`))
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

const createContextMenu = (project) => {
  const template = [
    getConnectToDevOrgItem(project), seperator(), 
    getStartFeature(project), getFeatures(project), seperator(),
    getScratchOrgItems(project), seperator(),
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
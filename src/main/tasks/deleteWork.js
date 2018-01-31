const Storage = require('../storage')
const GitHelper = require('../gitHelper')
const sfdx = require('../sfdx')
const {alert, log} = require('../utilities')

const deleteWork = (project, feature, refreshMenu) => {
  return (
    Storage.getProject(project)
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
  )
}

module.exports = deleteWork
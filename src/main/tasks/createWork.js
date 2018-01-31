const Storage = require('../storage')
const WindowManager = require('../windowManager')
const GitHelper = require('../gitHelper')
const sfdx = require('../sfdx')
const {logp, alert, log} = require('../utilities')

const createFeature = (project, refreshMenu) => {

  return (
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
              .then(() => alert(`${feature.name} is now ready`))
        )  
  )  
}

module.exports = createFeature
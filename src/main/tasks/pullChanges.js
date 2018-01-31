const WindowManager = require('../windowManager')
const GitHelper = require('../gitHelper')
const sfdx = require('../sfdx')
const {logp} = require('../utilities')

const pullChanges = (project, feature) => {
  return (
    GitHelper.switchBranch(feature.name)
      .then(() => logp(`Switched branch to`, 'Info', feature.name))
      .then(() => GitHelper.restoreStash(feature.name))
      .then(() => logp(`Finished restore stash. Started pull from ${feature.scratchOrg}`, 'Info'))
      .then(() => sfdx.pullSource(project, { alias: feature.scratchOrg }))
      .then(data => logp(`Data from pull`, 'Info', data))
      .then(() => GitHelper.add())
      .then(() => GitHelper.changeSummary())
      .then(data => logp(`Data from GitHelper.changeSummary`, 'Info', data))
      .then(data => 
        WindowManager.showPullDifferences(project, feature, data)
          .then(message => logp(`Commiting for ${feature.name}`, 'Info', message))
          .then(({status, message}) => {
            if (status == 'commit') {
              if (data) {
                if (data.length > 0) {
                  return GitHelper.addCommitAndPush(feature.name, message)
                    .then(() => logp(`Changes for ${feature.name} committed with message ${message}`, 'Info', data))    
                } else {
                  return logp(`Nothing to commit `, 'Info', data)
                }
              }
            } else {
              return GitHelper.stash(feature.name)
                .then(() => logp(`Stashing changes for the future for ${feature.name}`, 'Info', data))
            }
          }))
  )
}

module.exports = pullChanges
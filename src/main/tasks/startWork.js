const GitHelper = require('../gitHelper')
const sfdx = require('../sfdx')

const startWork = (feature) => {
  return (
    GitHelper.switchBranch(feature.name)
      .then(() => sfdx.openScratchOrg({ alias: feature.scratchOrg }))
      
  )
}

module.exports = startWork
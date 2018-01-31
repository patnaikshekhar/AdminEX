const sfdx = require('../sfdx')
const {alert, logp} = require('../utilities')
const WindowManager = require('../windowManager')

const createScratchOrg = (project, refreshMenu) => {
  return (
    WindowManager.selectScratchOrgDetails()
      .then(options => sfdx.createScratchOrg(project, options))
      .then(options => logp('Finished createScratchOrg', 'Info', options))
      .then(options => sfdx.pushSource(project, options))
      .then(options => logp('Finished pushSource', 'Info', options))
      .then(options => sfdx.openScratchOrg(options))
      .then(options => logp('Finished openScratchOrg', 'Info', options))
      .then(options => refreshMenu(project, options))
      .then(options => logp('Finished refreshMenu', 'Info', options))
      .then(options => alert(`${options.alias} is now ready`))
  )
}


module.exports = createScratchOrg
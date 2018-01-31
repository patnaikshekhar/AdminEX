const sfdx = require('../sfdx')
const {logp, alert} = require('../utilities')

const deleteScratchOrg = (alias, project, refreshMenu) => {
  return (
    sfdx.deleteScratchOrg({ alias })
      .then(options => logp('Finished deleteScratchOrg', 'Info'))
      .then(() => refreshMenu(project))
      .then(options => alert(`${alias} is Deleted`))
  )
}

module.exports = deleteScratchOrg


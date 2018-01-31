const Storage = require('../storage')
const {alert} = require('../utilities')
const {app} = require('electron')

const authDevHub = (project, ) => {
  return (
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
  )
}

module.exports = authDevHub


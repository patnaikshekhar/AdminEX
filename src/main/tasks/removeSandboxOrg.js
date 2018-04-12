const sfdx = require('../sfdx')
const Storage = require('../storage')
const { log } = require('../utilities')

const removeSandboxOrg = (project, alias) => {

  log(`removeSandboxOrg removing sandbox ${alias}`, 'Info')

  return sfdx.deleteScratchOrg({ alias })
    .then(() => log(`removeSandboxOrg delete scratch org complete for ${alias}`, 'Info'))
    .then(() => Storage.getProject(project))
    .then((project) => {
      log(`removeSandboxOrg removing sandbox from storage in project ${project.name}`, 'Info')
      if (project.sandboxes) {
        project.sandboxes = project.sandboxes.filter(s => s.alias != alias)
        log(`removeSandboxOrg removing sandbox from storage in project ${project.name} new sandbox list ${JSON.stringify(project.sandboxes)}`, 'Info')
      }

      return Storage.updateProject(project)
    })
}

module.exports = removeSandboxOrg
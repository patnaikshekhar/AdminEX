const SimpleGit = require("simple-git/promise")
const Settings = require('./settings')
var currentRepo = null
const Path = require('path')
const diff2html = require("diff2html").Diff2Html
const fs = require('fs')
const shell = require('shelljs')
const Utilties = require('./utilities')

const createProject = ({directory, repositoryURL, existingProject}) => {

  const developBranch = Settings().developBranch
  return createDirectoryRecursive(directory)
    .then(() => {
      return SimpleGit().clone(repositoryURL, directory)
    })
    .then(() => {
      currentRepo = SimpleGit(directory)
      return currentRepo.checkout(developBranch)
    })
}

const openProject = ({directory}) => {

  const developBranch = Settings().developBranch

  currentRepo = SimpleGit(directory)
  return currentRepo.branch()
    .then(result => stash(result.current))
    .then(() => currentRepo.checkout(developBranch))
}

const createFeatureBranch = (branchName) => {
  const developBranch = Settings().developBranch

  return currentRepo.checkout(developBranch)
    .then(() => currentRepo.pull('origin', developBranch))
    .then(() => currentRepo.checkoutLocalBranch(branchName))
}

const switchBranch = (branchName) => currentRepo.checkout(branchName)

const deleteBranch = (branchName) => {
  const developBranch = Settings().developBranch

  return currentRepo.checkout(developBranch)
    // .then(() => currentRepo.deleteLocalBranch(branchName))
    .then(() => currentRepo.raw(['branch', '-D', branchName]))
}

const removeChanges = () => {
  return currentRepo.raw(['clean', '-f', '-d'])
}

const addCommitAndPush = (branchName, message) => {
  return currentRepo.add('./*')
      .then(() => currentRepo.commit(message))
      .then(() => currentRepo.push('origin', branchName))
}

const restoreStash = (branchName) => {
  const stashName = `${branchName}stash`
  return currentRepo.stashList()
    .then(({ all }) => {
      const stash = all
        .map((o, index) => Object.assign(o, { index }))
        .filter(({ message }) => {
          return message.indexOf(stashName) > -1
        })

      if (stash.length > 0) {
        return currentRepo.stash(['pop', `stash@{${stash[0].index}}`])
      } else {
        return null;
      }
    })
}

const changeSummary = (project) => {
  return currentRepo.status()
    .then(data => data.files ? data.files.map(({index, path}) => ({
      state: index == 'D' ? 'Deleted' : (index == 'A' ? 'Add' : 'Changed' ),
      fullName: Path.basename(path.replace(/"/g, '')),
      filePath: path.replace(/"/g, '')
    })): [])
    .then(data => Promise.all(data.map(fileData => Utilties.getMetadataTypeForFile(project, fileData))))
    //.then(data => Utilties.logp(`changeSummary result for project ${project.name}`, data))
}

const stash = (branchName) => {
  return currentRepo.stash([`save`, `${branchName}stash`])
}

const add = () => {
  return currentRepo.add('./*')
}

const getDiffHTML = (data) => {
  console.log('getDiffHTML for', data.filePath)
  return currentRepo.diff(['--cached', data.filePath])
    .then(difference => {
      return diff2html.getPrettySideBySideHtmlFromDiff(difference)
    })
}

/*const createDirectoryRecursive = (targetDir) => new Promise((resolve, reject) => {
  const sep = Path.sep
  const initDir = Path.isAbsolute(targetDir) ? sep : ''
  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = Path.resolve(parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code !== 'EEXIST' && err.code !== 'EISDIR') { 
        reject(err)
      }
    }
    return curDir;
  }, initDir)

  resolve()
})*/

const createDirectoryRecursive = (targetDir) => new Promise((resolve, reject) => {
	try {
		shell.mkdir('-p', targetDir)
		resolve()
	} catch(e) {
		reject(e)
	}
})

const undoFileChanges = (branchName, filename, action) => {
  const developBranch = Settings().developBranch
  console.log('Action', action)
  return stash(branchName)
    .then(() => currentRepo.checkout(developBranch))
    .then(() => currentRepo.pull('origin', developBranch))
    .then(() => currentRepo.checkout(branchName))
    .then(() => restoreStash(branchName))
    .then(() => action == 'Add' ? 
      currentRepo.reset([filename])
        .then(() => currentRepo.clean('f', [filename])) :
      currentRepo.raw(['checkout', developBranch, '--', filename])
    )
}

module.exports = {
  createProject,
  openProject,
  createFeatureBranch,
  switchBranch,
  deleteBranch,
  removeChanges,
  addCommitAndPush,
  restoreStash,
  stash,
  changeSummary,
  add,
  getDiffHTML,
  undoFileChanges
}
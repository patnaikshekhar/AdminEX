const SimpleGit = require("simple-git/promise")
const Settings = require('./settings')
var currentRepo = null
const Path = require('path')
const diff2html = require("diff2html").Diff2Html
const fs = require('fs')

const createProject = ({directory, repositoryURL}) => {
  const developBranch = Settings().developBranch
  return createDirectoryRecursive(directory)
    .then(() => SimpleGit().clone(repositoryURL, directory))
    .then(() => {
      currentRepo = SimpleGit(directory)
      return currentRepo.checkout(developBranch)
    })
}

const openProject = ({directory}) => {

  const developBranch = Settings().developBranch

  currentRepo = SimpleGit(directory)
  return currentRepo.checkout(developBranch)
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
    .then(() => currentRepo.deleteLocalBranch(branchName))
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

const changeSummary = () => {
  return currentRepo.status()
    .then(data => { console.log(data); return data })
    .then(data => data.files ? data.files.map(({index, path}) => ({
      state: index == 'D' ? 'Deleted' : (index == 'A' ? 'Add' : 'Changed' ),
      fullName: Path.basename(path),
      filePath: path
    })): [])
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

const createDirectoryRecursive = (targetDir) => new Promise((resolve, reject) => {
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
})

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
  getDiffHTML
}
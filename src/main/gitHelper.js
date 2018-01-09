const SimpleGit = require("simple-git/promise")
const Settings = require('./settings')
var currentRepo = null

const createProject = ({directory, repositoryURL}) => {
  const developBranch = Settings().developBranch

  return SimpleGit().clone(repositoryURL, directory)
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

      console.log('Stash is ', stash)
      if (stash.length > 0) {
        return currentRepo.stash(['pop', `stash@{${stash[0].index}}`])
      } else {
        return null;
      }
    })
}

const stash = (branchName) => {
  return currentRepo.stash([`save`, `${branchName}stash`])
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
  stash
}
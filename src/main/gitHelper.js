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

module.exports = {
  createProject,
  openProject
}
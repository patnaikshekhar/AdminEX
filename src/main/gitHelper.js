const Git = require("nodegit")

const createProject = (directory, repositoryURL) => {
  console.log('Cloning in', directory, repositoryURL)
  return Git.Clone(repositoryURL, directory)
}

module.exports = {
  createProject
}

//createProject('https://github.com/patnaikshekhar/Salesforce-Platform-Developer-1-Exam-Notes', './Temp')
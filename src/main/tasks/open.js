const { shell } = require('electron')

const openRepositoryURL = ({ repositoryURL }) => new Promise((resolve, reject) => {
  const result = shell.openExternal(repositoryURL)
  if (result) {
    resolve()
  } else {
    reject('Could not open repository')
  }
})

const openRepositoryFolder = ({ directory }) => new Promise((resolve, reject) => {
  const result = shell.showItemInFolder(directory)
  if (result) {
    resolve()
  } else {
    reject('Could not open folder')
  }
})

module.exports = {
  openRepositoryURL,
  openRepositoryFolder
}
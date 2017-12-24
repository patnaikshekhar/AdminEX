const {dialog} = require('electron').remote
const PROJECT_SELECT_SELECTOR = '.project-select'
const CREATE_PROJECT_SELECTOR = '.create-project'

const showError = (error) => {
  console.error(error)
}

const switchPage = (selector, show) => {
  const elements = document.querySelectorAll(selector)
  for (var w = 0; w < elements.length; w++) {
    if (show) {
      elements[w].style.display = 'block'
    } else {
      elements[w].style.display = 'none'
    }
  }
}

const setSelectFolderListener = () => {
  document.getElementById('selectFolder').addEventListener('click', () => {
    const repositoryURL = document.getElementById('repositoryLocation').value
    if (repositoryURL) {
      const directory = dialog.showOpenDialog({properties: ['openDirectory']})
      console.log(directory)
      createProject(directory, repositoryURL)
    } else {
      showError('You must enter a respoitory URL')
    }
  })
}

const createProject = (directory, repositoryURL) => {
  // Send to backend
  
  switchPage(PROJECT_SELECT_SELECTOR, true)
  switchPage(CREATE_PROJECT_SELECTOR, false)
}

module.exports = () => {
  document.getElementById('newProject').addEventListener('click', () => {
    switchPage(PROJECT_SELECT_SELECTOR, false)
    switchPage(CREATE_PROJECT_SELECTOR, true)
    setSelectFolderListener()
  })
}
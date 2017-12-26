const {dialog} = require('electron').remote
const {ipcRenderer} = require('electron')
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
    const name = document.getElementById('projectName').value

    if (repositoryURL) {
      const directory = dialog.showOpenDialog({properties: ['openDirectory']})
      createProject(name, directory, repositoryURL)
    } else {
      showError('You must enter a respoitory URL')
    }
  })
}

const createProject = (name, directory, repositoryURL) => {
  // Send to backend
  ipcRenderer.send('createProject', {
    name,
    directory: directory[0],
    repositoryURL
  })

  switchPage(PROJECT_SELECT_SELECTOR, true)
  switchPage(CREATE_PROJECT_SELECTOR, false)
}

const displayProjects = (projects) => {
  const projectList = document.getElementById('projectList')
  while(projectList.firstChild) {
    projectList.removeChild(projectList.firstChild)
  }

  projects.forEach((project, index) => {
    const tr = document.createElement('tr')
    const indexTd = document.createElement('td')
    indexTd.innerText = index + 1

    const locationTd = document.createElement('td')
    locationTd.innerText = project.name

    const repoTd = document.createElement('td')
    repoTd.innerText = project.directory

    const actionTd = document.createElement('td')
    const openButton = document.createElement('button')
    openButton.innerText = 'Open'
    openButton.className = 'slds-button'
    openButton.addEventListener('click', () => {
      ipcRenderer.send('setProject', project)
    })
    actionTd.appendChild(openButton)

    tr.appendChild(indexTd)
    tr.appendChild(actionTd)
    tr.appendChild(locationTd)
    tr.appendChild(repoTd)

    projectList.appendChild(tr)
  })
}

module.exports = () => {

  // Get List of projects from server
  ipcRenderer.send('projects')
  ipcRenderer.on('projects', (event, value) => {
    displayProjects(value.projects)
  })

  document.getElementById('newProject').addEventListener('click', () => {
    switchPage(PROJECT_SELECT_SELECTOR, false)
    switchPage(CREATE_PROJECT_SELECTOR, true)
    setSelectFolderListener()
  })
}
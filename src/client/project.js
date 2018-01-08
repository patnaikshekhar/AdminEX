const {dialog} = require('electron').remote
const {ipcRenderer} = require('electron')
const { authDevHub } = require('../main/sfdx')
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
    const directory = dialog.showOpenDialog({properties: ['openDirectory']})
    document.getElementById('folderLocation').value = directory
  })

  document.getElementById('authDevHub').addEventListener('click', () => {
    const name = document.getElementById('projectName').value
    const directory = document.getElementById('folderLocation').value
    const repositoryURL = document.getElementById('repositoryLocation').value

    if (repositoryURL && directory && name) {
      authDevHub({
        name
      }).then(devHubAlias => {
        createProject(name, directory, repositoryURL, devHubAlias)
      }).catch(e => showError(e))
      
    } else {
      showError('Please fill in the required fields')
    }
  })
}

const createProject = (name, directory, repositoryURL, devHubAlias) => {
  // Send to backend
  ipcRenderer.send('createProject', {
    name,
    directory,
    repositoryURL,
    devHubAlias
  })

  switchPage(PROJECT_SELECT_SELECTOR, true)
  switchPage(CREATE_PROJECT_SELECTOR, false)
}

const displayProjects = (projects) => {
  const projectList = document.getElementById('projectList')
  while(projectList.firstChild) {
    projectList.removeChild(projectList.firstChild)
  }

  if (projects.length != 0) {
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
  } else {
    document.getElementById('noProjects').style.display = 'block'
    document.getElementById('projectsTable').style.display = 'none'
  }
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

  document.getElementById('noProjectsClick').addEventListener('click', () => {
    switchPage(PROJECT_SELECT_SELECTOR, false)
    switchPage(CREATE_PROJECT_SELECTOR, true)
    setSelectFolderListener()
  })
}
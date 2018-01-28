import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import CreateProject from './createProject'
import ViewProjects from './viewProjects'
import ElectronBody from './electronBody'
const {ipcRenderer} = require('electron')
const { authDevHub } = require('../src/main/sfdx')

let root = document.getElementById('root')

class ProjectPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      createProject: false,
      project: {},
      projects: []
    }
  }

  componentWillMount() {
    ipcRenderer.send('projects')
    ipcRenderer.on('projects', (event, { projects }) => {
      this.setState({
        projects
      })
    })
  }

  openProject(project) {
    ipcRenderer.send('setProject', project)
  }

  projectDetailsChanged(project) {
    this.setState({ project })
  }

  navCreateProject() {
    this.setState({
      createProject: true
    })
  }

  createProject() {

    const {name, directory, repositoryURL} = this.state.project

    authDevHub({
      name
    }).then(devHubAlias => {
      ipcRenderer.send('createProject', {
        name,
        directory,
        repositoryURL,
        devHubAlias
      })
    }).catch(e => console.error(e))
  }

  render() {
    return (
      <div>
        <Header>
          { !this.state.createProject ? 
            <button 
              className="slds-button slds-button_brand" 
              onClick={this.navCreateProject.bind(this)}>New Project</button> :
            <button 
              className="slds-button slds-button_brand"
              onClick={this.createProject.bind(this)}
              >Create</button>
          }
        </Header>
        <ElectronBody>
          { this.state.createProject ? 
            <CreateProject 
              projectDetailsChanged={this.projectDetailsChanged.bind(this)} /> : 
            <ViewProjects 
              projects={this.state.projects} 
              openProject={this.openProject.bind(this)} 
              createProject={this.navCreateProject.bind(this)}/>
          }
        </ElectronBody>
      </div>
    )
  }
}

ReactDOM.render(<ProjectPage />, root)


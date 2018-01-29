import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import CreateProject from './createProject'
import ViewProjects from './viewProjects'
import ElectronBody from './electronBody'
import Alert from './alert'

const {ipcRenderer} = require('electron')
const { authDevHub } = require('../src/main/sfdx')

let root = document.getElementById('root')

class ProjectPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      createProject: false,
      project: {},
      projects: [],
      error: ''
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
              >Authorise DevHub</button>
          }
        </Header>
        <ElectronBody>
          { this.state.error ?
            <Alert type="error">{ this.state.error }</Alert> :
            ''
          }

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

    if (name && directory && repositoryURL) {
      authDevHub({
        name
      }).then(devHubAlias => {
        ipcRenderer.send('createProject', {
          name,
          directory,
          repositoryURL,
          devHubAlias
        })
      }).catch(e => this.setState({
        error: e.toString()
      }))
    } else {
      this.setState({
        error: 'Please fill in required fields.'
      })
    }
  }
}

ReactDOM.render(<ProjectPage />, root)


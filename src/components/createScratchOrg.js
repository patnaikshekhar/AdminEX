import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
import InputFile from './inputFile'
import Alert from './alert'
import Tabs from './tabs'
import Tab from './tab'
import NewShape from './newShape'

const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const fs = require('fs')

let root = document.getElementById('root')

class CreateScratchOrgPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      alias: '',
      location: '',
      error: '',
      activeTab: 0,
      project: null,
      shape: {
        orgName: '',
        edition: 'Enterprise',
        features: [],
        orgPreferences: {
          enabled: [],
          disabled: []
        }
      },
      listOfFeatures: [],
      listOfPrefs: []
    }

    this.styles = {
      inputName: {
        marginBottom: '10px',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '20px'
      },
      inputStyles: {
        marginBottom: '10px',
        paddingLeft: '20px',
        paddingRight: '20px',
        marginTop: '15px'
      }
    }
  }

  componentWillMount() {
    ipcRenderer.send('createScratchOrg.getProjectDetails')
    ipcRenderer.once('createScratchOrg.projectDetails', (event, {project, features, prefs}) => {
      this.setState({ 
        location: project.directory + '/config/project-scratch-def.json',
        project,
        listOfFeatures: features,
        listOfPrefs: prefs
      })
    })
  }

  render() {
    return (
      <div>
        <Header>
            <button 
              className="slds-button slds-button_brand"
              onClick={this.create.bind(this)}>
              Create
            </button>
        </Header>
        <ElectronBody>
          { this.state.error ?
            <Alert type="error">{ this.state.error }</Alert> :
            ''
          }

          <InputText 
            label="Scratch Org Name" 
            placeholder="Name of scratch org" 
            required="true"
            onChange={alias => {
              this.setState({ 
                alias, 
                shape: Object.assign(this.state.shape, {
                  orgName: alias
                })
              })
            }}
            style={this.styles.inputName}
            value={this.state.alias} />
          <Tabs onTabChange={this.onTabChange.bind(this)}>
            <Tab label="Existing Shape">
              <InputFile
                label="Template File Location" 
                placeholder="Enter location of template" 
                required="true"
                type="openFile"
                onChange={location => {
                  this.setState({ location })
                }}
                style={this.styles.inputStyles}
                value={this.state.location} />
            </Tab>
            <Tab label="New Shape">
              <NewShape 
                onShapeDataChange={this.onShapeDataChange.bind(this)} 
                shape={this.state.shape} 
                features={this.state.listOfFeatures} 
                prefs={this.state.listOfPrefs} />
            </Tab>
          </Tabs>
        </ElectronBody>
      </div>
    )
  }

  create() {
    
    let {activeTab, alias, location, shape} = this.state

    if (!alias) {
      this.setState({
        error: 'Please fill in Scratch Org Name'
      })
      return;
    }

    if (activeTab == 0 && !location) {
      this.setState({
        error: 'Please fill in location of definition file'
      })
      return;
    }

    if (activeTab == 0) {
      if (!fs.existsSync(location)) {
        this.setState({
          error: 'Cannot find definition file. Please check location.'
        })
        return;
      }
    }

    if (activeTab == 1 && !shape.orgName) {
      this.setState({
        error: 'Please fill in name of the shape'
      })

      return;
    }

    if (activeTab == 1) {
      const fileName = dialog.showSaveDialog({
        title: 'Save New Definition File',
        defaultPath: this.state.project ? `${this.state.project.directory}/config/${shape.orgName}.json` : `${shape.orgName}.json`,
        nameFieldLabel: 'Definition File Name',
        showsTagField: false
      })

      if (fileName) {
        fs.writeFileSync(fileName, JSON.stringify(shape, null, 2))
        location = fileName
      } else {
        return;
      }
    }

    if (alias && location) {
      ipcRenderer.send('createScratchOrg', {
        alias,
        location
      })
    } else {
      this.setState({
        error: 'Please fill in required fields'
      })
    }
  }

  onShapeDataChange(shape) {
    this.setState({
      shape
    })
  }

  onTabChange(index) {
    this.setState({
      activeTab: index
    })
  }
}

ReactDOM.render(<CreateScratchOrgPage />, root)


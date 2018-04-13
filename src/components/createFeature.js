import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
import Tabs from './tabs'
import Tab from './tab'
import InputSelect from './inputSelect'
import InputFile from './inputFile'
import NewShape from './newShape'
import Alert from './alert'

const {ipcRenderer, shell} = require('electron')
const {dialog} = require('electron').remote
const fs = require('fs')

let root = document.getElementById('root')

class CreateFeaturePage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      name: '',
      location: '/config/project-scratch-def.json',
      existingOrg: '',
      orgs: [],
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

    this.inputStyles = {
      marginBottom: '25px',
      padding: '20px',
      marginTop: '20px'
    }
  }

  componentWillMount() {
    ipcRenderer.send('createFeature.init')
    ipcRenderer.once('createFeature.initResult', (event, {orgs, project, features, prefs }) => {
      this.setState({ 
        location: project.directory + '/config/project-scratch-def.json',
        orgs,
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
            label="Feature Name" 
            placeholder="Work Item Number" 
            onChange={name => {
              if (this.isValidName(name)) {
                this.setState({ 
                  name, 
                  shape: Object.assign(this.state.shape, {
                    orgName: name
                  })
                })
              }
            }}
            required="true"
            style={this.inputStyles}
            value={this.state.name} />
          <Tabs onTabChange={this.onTabChange.bind(this)}>
            <Tab label="New Org from Existing Template">
              <InputFile 
                label="Template File Location" 
                placeholder="Location of template file" 
                required="true"
                type="openFile"
                onChange={location => {
                  this.setState({ location })
                }}
                required="true"
                style={this.inputStyles}
                value={this.state.location} />
            </Tab>
            <Tab label="New Org from New Template">
              <NewShape 
                  onShapeDataChange={this.onShapeDataChange.bind(this)} 
                  shape={this.state.shape} 
                  features={this.state.listOfFeatures} 
                  prefs={this.state.listOfPrefs} />
            </Tab>
            <Tab label="Use Existing Org">
              <InputSelect 
                label="Select Scratch Org"
                onChange={existingOrg => {
                  this.setState({ existingOrg })
                }}
                required="true"
                style={this.inputStyles}
                value={this.state.existingOrg} 
                options={ this.state.orgs }/>
            </Tab>
          </Tabs>
        </ElectronBody>
      </div>
    )
  }

  create() {

    let {name, location, existingOrg, activeTab, shape} = this.state

    if (!name) {
      this.setState({
        error: 'Feature name is a required field'
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
        error: 'Please fill in org name of the shape'
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

    let payload = {}

    if (activeTab == 0 || activeTab == 1) {
      payload = { name, location }
    } else if (activeTab == 2) {
      payload = { name, existingOrg }
    }

    ipcRenderer.send('createFeature', payload)
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

  isValidName(value) {
    if (value.indexOf(" ") > -1 || 
      value.indexOf('.') > -1 || 
      value.indexOf('~') > -1 ||
      value.indexOf('^') > -1 ||
      value.indexOf(':') > -1 ||
      value.indexOf('\\') > -1 ||
      value.indexOf('/') > -1) {
      return false
    } else {
      return true 
    }
  }
}

ReactDOM.render(<CreateFeaturePage />, root)


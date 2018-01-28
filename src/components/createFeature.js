import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
import Tabs from './tabs'
import Tab from './tab'
import InputSelect from './inputSelect'

const {ipcRenderer, shell} = require('electron')

let root = document.getElementById('root')

class CreateFeaturePage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      name: '',
      location: '/config/project-scratch-def.json',
      existingOrg: '',
      orgs: []
    }

    this.inputStyles = {
      marginBottom: '25px',
      padding: '20px',
      marginTop: '20px'
    }
  }

  componentWillMount() {
    ipcRenderer.send('getScratchOrgs')
    ipcRenderer.once('orgs', (event, orgs) => {
      this.setState({ orgs })
    })
  }

  create() {
    ipcRenderer.send('createFeature', {
      name: this.state.name,
      location: this.state.location,
      existingOrg: this.state.existingOrg
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
          <InputText 
            label="Feature Name" 
            placeholder="Work Item Number" 
            onChange={name => {
              this.setState({ name })
            }}
            style={this.inputStyles}
            value={this.state.name} />
          <Tabs>
            <Tab label="Create New Org">
              <InputText 
                label="Template File Location" 
                placeholder="Location of template file" 
                onChange={location => {
                  this.setState({ location })
                }}
                style={this.inputStyles}
                value={this.state.location} />
            </Tab>
            <Tab label="Existing Org">
              <InputSelect 
                label="Select Scratch Org"
                onChange={existingOrg => {
                  this.setState({ existingOrg })
                }}
                style={this.inputStyles}
                value={this.state.existingOrg} 
                options={ this.state.orgs }/>
            </Tab>
          </Tabs>
        </ElectronBody>
      </div>
    )
  }
}

ReactDOM.render(<CreateFeaturePage />, root)


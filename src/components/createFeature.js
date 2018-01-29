import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
import Tabs from './tabs'
import Tab from './tab'
import InputSelect from './inputSelect'
import Alert from './alert'

const {ipcRenderer, shell} = require('electron')

let root = document.getElementById('root')

class CreateFeaturePage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      name: '',
      location: '/config/project-scratch-def.json',
      existingOrg: '',
      orgs: [],
      error: ''
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
              this.setState({ name })
            }}
            required="true"
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
                required="true"
                style={this.inputStyles}
                value={this.state.location} />
            </Tab>
            <Tab label="Existing Org">
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

    const {name, location, existingOrg} = this.state

    if (name && (location || existingOrg)) {
      ipcRenderer.send('createFeature', {
        name,
        location,
        existingOrg
      })
    } else {
      this.setState({
        error: 'Please fill in required fields'
      })
    }
  }
}

ReactDOM.render(<CreateFeaturePage />, root)


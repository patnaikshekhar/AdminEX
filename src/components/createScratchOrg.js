import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'

const {ipcRenderer} = require('electron')

let root = document.getElementById('root')

class CreateScratchOrgPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      alias: '',
      location: '/config/project-scratch-def.json'
    }

    this.inputStyles = {
      marginBottom: '25px',
      padding: '20px',
      marginTop: '20px'
    }
  }

  create() {
    ipcRenderer.send('createScratchOrg', this.state)
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
            label="Scratch Org Name" 
            placeholder="Name of scratch org" 
            onChange={alias => {
              this.setState({ alias })
            }}
            style={this.inputStyles}
            value={this.state.alias} />
          <InputText 
            label="Template File Location" 
            placeholder="Enter location of template" 
            onChange={location => {
              this.setState({ location })
            }}
            style={this.inputStyles}
            value={this.state.location} />
        </ElectronBody>
      </div>
    )
  }
}

ReactDOM.render(<CreateScratchOrgPage />, root)


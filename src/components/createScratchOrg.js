import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
import Alert from './alert'

const {ipcRenderer} = require('electron')

let root = document.getElementById('root')

class CreateScratchOrgPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      alias: '',
      location: '/config/project-scratch-def.json',
      error: ''
    }

    this.inputStyles = {
      marginBottom: '25px',
      padding: '20px',
      marginTop: '20px'
    }
  }

  create() {
    
    const {alias, location} = this.state

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
              this.setState({ alias })
            }}
            style={this.inputStyles}
            value={this.state.alias} />
          <InputText 
            label="Template File Location" 
            placeholder="Enter location of template" 
            required="true"
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


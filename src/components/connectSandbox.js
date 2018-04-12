import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
import Alert from './alert'

const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const fs = require('fs')

let root = document.getElementById('root')

class ConnectSandbox extends React.Component {
  
  constructor() {
    super()
    this.state = {
      name: '',
      instanceURL: 'https://test.salesforce.com',
      error: null
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

  render() {
    return (
      <div>
        <Header>
            <button 
              className="slds-button slds-button_brand"
              onClick={this.connect.bind(this)}>
              Connect
            </button>
        </Header>
        <ElectronBody>
          { this.state.error ?
            <Alert type="error">{ this.state.error }</Alert> :
            ''
          }

          <InputText 
            label="Sandbox Name" 
            required="true"
            onChange={name => this.setState({ name }) }
            style={this.styles.inputName}
            value={this.state.name} />
          
          <InputText 
            label="Instance URL" 
            required="true"
            onChange={instanceURL => this.setState({ instanceURL }) }
            style={this.styles.inputName}
            value={this.state.instanceURL} />

        </ElectronBody>
      </div>
    )
  }

  connect() {
    
    let { name, instanceURL } = this.state

    if (name && instanceURL) {
      ipcRenderer.send('connectSandbox.connectSandbox', {
        name,
        instanceURL
      })
    } else {
      this.setState({
        error: 'Please fill in required fields'
      })
    }
  }
}

ReactDOM.render(<ConnectSandbox />, root)


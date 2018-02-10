import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import InputText from './inputText'
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
      location: '/config/project-scratch-def.json',
      error: '',
      activeTab: 0,
      shape: {
        name: '',
        edition: '',
        features: [],
        enabledPrefs: [],
        disabledPrefs: []
      }
    }

    this.inputStyles = {
      marginBottom: '25px',
      padding: '20px',
      marginTop: '20px'
    }
  }

  onTabChange(index) {
    this.setState({
      activeTab: index
    })
  }

  create() {
    
    const {activeTab, alias, location, shape} = this.state

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

    if (activeTab == 1 && !shape.name) {
      this.setState({
        error: 'Please fill in name of the shape'
      })

      return;
    }

    if (activeTab == 1) {
      const fileName = dialog.showSaveDialog({
        title: `${shape.name}.json`,
      })
      fs.writeFileSync(fileName, shape)
    }
    // if (alias && location) {
    //   ipcRenderer.send('createScratchOrg', {
    //     alias,
    //     location
    //   })
    // } else {
    //   this.setState({
    //     error: 'Please fill in required fields'
    //   })
    // }
  }

  onShapeDataChange(shape) {
    this.setState({
      shape
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
                  name: alias
                })
              })
            }}
            style={this.inputStyles}
            value={this.state.alias} />
          <Tabs onTabChange={this.onTabChange.bind(this)}>
            <Tab label="Existing Shape">
              <InputText 
                label="Template File Location" 
                placeholder="Enter location of template" 
                required="true"
                onChange={location => {
                  this.setState({ location })
                }}
                style={this.inputStyles}
                value={this.state.location} />
            </Tab>
            <Tab label="New Shape">
              <NewShape 
                onShapeDataChange={this.onShapeDataChange.bind(this)} 
                shape={this.state.shape} />
            </Tab>
          </Tabs>
        </ElectronBody>
      </div>
    )
  }
}

ReactDOM.render(<CreateScratchOrgPage />, root)


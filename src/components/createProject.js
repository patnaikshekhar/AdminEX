import React from 'react'
import InputText from './inputText'
import InputFile from './inputFile'
import InputToggle from './inputToggle';
import Tabs from './tabs'
import Tab from './tab'

class CreateProject extends React.Component {

  constructor() {
    super()
    this.state = {
      name: '',
      repositoryURL: '',
      directory: '',
      repositoryUsername: '',
      repositoryPassword: '',
      existingProject: true
    }

    this.inputStyles = {
      marginBottom: '5px',
      padding: '20px',
      marginTop: '5px'
    } 
    
    this.repoStyle = {
      paddingLeft: '20px',
      paddingRight: '20px',
      marginBottom: '25px'
    }
  }

  render() {
    return (
      <Tabs>
        <Tab label="Basic">
          <div className=" slds-grid slds-wrap">
            <div className="slds-col slds-size_1-of-1">
              <InputText 
                label="Project Name" 
                placeholder="Name of project" 
                required="true"
                onChange={(value) => {
                  this.setState({ name: value }, () => {
                    this.props.projectDetailsChanged(this.state)
                  })
                }} 
                style={this.inputStyles}
                value={this.state.name} />
            </div>
            <div className="slds-col slds-size_1-of-1">
              <InputFile 
                label="Project Folder" 
                placeholder="Select project folder"
                required="true"
                type="openDirectory"
                onChange={(value) => {
                  this.setState({ directory: value }, () => {
                    this.props.projectDetailsChanged(this.state)
                  })
                }} 
                style={this.inputStyles}
                value={this.state.directory} />
            </div>
            <div className="slds-col slds-size_1-of-1">
              <div>
                <InputText 
                  label="Project Repository" 
                  placeholder="Enter git URL of repository"
                  required="true"
                  onChange={(value) => {
                    this.setState({ repositoryURL: value }, () => {
                      this.props.projectDetailsChanged(this.state)
                    })
                  }} 
                  style={this.inputStyles}
                  value={this.state.repositoryURL} />
              </div>
            </div>
          </div>
        </Tab>
        <Tab label="Advanced">
          <div className=" slds-grid slds-wrap">
            <div className="slds-col slds-size_1-of-1">
              <InputToggle 
                label="Existing Project"
                enabledLabel="Yes"
                disabledLabel="No"
                onChange={(value) => {
                  console.log(value)
                  this.setState({ existingProject: value }, () => {
                    this.props.projectDetailsChanged(this.state)
                  })
                }}
                style={this.inputStyles}
                value={this.state.existingProject}
                />
            </div>
            <div className="slds-col slds-size_1-of-1">
              <div className="slds-grid">
                  <div className="slds-col">
                    <InputText 
                      label="Repository Username" 
                      placeholder="Enter username if any"
                      onChange={(value) => {
                        this.setState({ repositoryUsername: value }, () => {
                          this.props.projectDetailsChanged(this.state)
                        })
                      }} 
                      style={this.repoStyle}
                      value={this.state.repositoryUsername} />
                  </div>
                  <div className="slds-col">
                    <InputText 
                      label="Repository Password" 
                      placeholder="Enter password if any"
                      onChange={(value) => {
                        this.setState({ repositoryPassword: value }, () => {
                          this.props.projectDetailsChanged(this.state)
                        })
                      }} 
                      style={this.repoStyle}
                      type="password"
                      value={this.state.repositoryPassword} />
                  </div>
                </div>
            </div>
          </div>
        </Tab>
      </Tabs>
      
    )
  }
}

export default CreateProject
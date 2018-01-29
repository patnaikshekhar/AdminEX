import React from 'react'
import InputText from './inputText'
import InputFile from './inputFile'

class CreateProject extends React.Component {

  constructor() {
    super()
    this.state = {
      name: '',
      repositoryURL: '',
      directory: ''
    }

    this.inputStyles = {
      marginBottom: '25px',
      padding: '20px',
      marginTop: '20px'
    }    
  }

  render() {
    return (
      <div className="create-project body">
        <InputText 
          label="Project Name" 
          placeholder="Name of project" 
          required="true"
          onChange={(value) => {
            this.setState({ name: value })
            this.props.projectDetailsChanged(this.state)
          }} 
          style={this.inputStyles}
          value={this.state.name} />

        <InputText 
          label="Project Repository" 
          placeholder="Enter git URL of repository"
          required="true"
          onChange={(value) => {
            this.setState({ repositoryURL: value })
            this.props.projectDetailsChanged(this.state)
          }} 
          style={this.inputStyles}
          value={this.state.repositoryURL} />

        <InputFile 
          label="Project Folder" 
          placeholder="Select project folder"
          required="true"
          type="openDirectory"
          onChange={(value) => {
            this.setState({ directory: value })
            this.props.projectDetailsChanged(this.state)
          }} 
          style={this.inputStyles}
          value={this.state.directory} />
      </div>
    )
  }
}

export default CreateProject
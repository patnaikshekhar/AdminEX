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
  }

  render() {
    return (
      <div className="create-project body">
        <InputText 
          label="Project Name" 
          placeholder="Name of project" 
          onChange={(value) => {
            this.setState({ name: value })
            this.props.projectDetailsChanged(this.state)
          }} 
          value={this.state.name} />

        <InputText 
          label="Project Repository" 
          placeholder="Enter git URL of repository" 
          onChange={(value) => {
            this.setState({ repositoryURL: value })
            this.props.projectDetailsChanged(this.state)
          }} 
          value={this.state.repositoryURL} />

        <InputFile 
          label="Project Folder" 
          placeholder="Select project folder"
          type="openDirectory"
          onChange={(value) => {
            this.setState({ directory: value })
            this.props.projectDetailsChanged(this.state)
          }} 
          value={this.state.directory} />
      </div>
    )
  }
}

export default CreateProject
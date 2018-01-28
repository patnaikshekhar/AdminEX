import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import Alert from './alert'
import Badge from './badge'
import InputText from './inputText'

const {ipcRenderer, shell} = require('electron')
const path = require('path')

let root = document.getElementById('root')

class PullDifferencesPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      message: '',
      project: {},
      data: []
    }

    this.styles = {
      Add: {
        backgroundColor: 'rgb(75, 202, 129)'
      },

      Changed: {
        backgroundColor: '#ffb75d'
      },

      Deleted: {
        backgroundColor: '#c23934'
      },

      input: {
        padding: '10px'
      }
    }
  }

  render() {
    return (
      <div>
        <Header>
            <button 
              className="slds-button slds-button_neutral"
              onClick={this.cancel.bind(this)}>
              Cancel
            </button>
            <button 
              className="slds-button slds-button_brand"
              onClick={this.commit.bind(this)}>
              Create
            </button>
        </Header>
        <ElectronBody>
          { this.state.data.length == 0 ? 
            <Alert type="warning">
              <h2>There are no changes in the scratch org.</h2>
            </Alert> : 
            <div>
              <InputText 
                label="Commit Message"
                placeholder="Enter Message here...."
                value={this.state.message}
                style={this.styles.input}
                onChange={(e) => {
                  this.setState({
                    message: e.target.value
                  })
                }} />
              <table className="slds-table slds-table_bordered slds-table_cell-buffer">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">State</th>
                    <th scope="col">Name</th>
                    <th scope="col">File Location</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  { this.state.data.map(row =>  
                    <tr key={row.filePath}>
                      <td><Badge style={this.styles[row.state]}>{row.state}</Badge></td>
                      <td>{row.fullName}</td>
                      <td onClick={() => this.openFile(row)}><a href="#">{row.filePath}</a></td>
                      <td>
                        <button 
                          className="slds-button slds-button_neutral"
                          onClick={() => this.openDiff(row)}>Diff</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          }
        </ElectronBody>
      </div>
    )
  }

  componentWillMount() {
    ipcRenderer.send('diffs')
    ipcRenderer.on('diffs', (event, {project, feature, data}) => {
      this.setState({
        message: `${feature.name} - Updated`,
        project: project,
        data: data
      })
    })
  }

  commit() {
    ipcRenderer.send('diffResult', {
      status: 'commit',
      message: this.state.message
    })
  }

  cancel() {
    ipcRenderer.send('diffResult', {
      status: 'cancel'
    })
  }

  openFile(item) {
    shell.openItem(path.join(this.state.project.directory, item.filePath))
  }

  openDiff(item) {
    ipcRenderer.send('getHTMLDiff', item)
  }
}

ReactDOM.render(<PullDifferencesPage />, root)


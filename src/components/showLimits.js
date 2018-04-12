import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import Alert from './alert'
import InputText from './inputText'
import Button from './button'
import Spinner from './spinner'


const {ipcRenderer} = require('electron')

let root = document.getElementById('root')

const styles = {
  input: {
    padding: '10px'
  }
}

const convertCamelCaseStringToFormattedString = (str) => {
  return str.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")
}

class ShowLimitsPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      limits: [],
      filter: ''
    }
  }

  render() {
    return (
      <div>
        <Header>
            <button 
              className="slds-button slds-button_neutral"
              onClick={this.cancel.bind(this)}>
              Close
            </button>
        </Header>
        <ElectronBody>
          { this.state.limits.length === 0 ? 
            <Spinner /> : 
            <div>
              <InputText 
                label="Search"
                style={styles.input}
                value={this.state.filter}
                onChange={(value) => this.setState({ filter: value }) } />

              <table className="slds-table slds-table_bordered slds-table_cell-buffer">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">Limit</th>
                    <th scope="col">Max</th>
                    <th scope="col">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  { this.state.limits.filter(l => l.name.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1).map(limit =>  
                    <tr key={limit.name}>
                      <td>{ convertCamelCaseStringToFormattedString(limit.name) }</td>
                      <td>{ limit.max }</td>
                      <td>{ limit.remaining }</td>
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
    ipcRenderer.send('showLimits.allLimits')
    ipcRenderer.on('showLimits.allLimits.response', (event, limits) => {
      this.setState({
        limits
      })
    })
  }

  cancel() {
    ipcRenderer.send('showLimits.close')
  }
}

ReactDOM.render(<ShowLimitsPage />, root)


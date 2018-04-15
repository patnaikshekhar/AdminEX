import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'
import Alert from './alert'
import InputSelect from './inputSelect'
import Button from './button'
import Spinner from './spinner'
import Section from './section'
import Tabs from './tabs'
import Tab from './tab'
import { convertCamelCaseStringToFormattedString } from './client_utilities'

const {ipcRenderer} = require('electron')

let root = document.getElementById('root')

const styles = {
  input: {
    padding: '10px'
  },
  success: {
    color: 'rgb(75, 202, 129)'
  },
  error: {
    color: '#c23934'
  },
  summaryStatName: {
    fontWeight: 'bold'
  },
  summaryStatus: {
    InProgress: {
      color: '#d35400'
    },
    Pending: {
      color: '#2c3e50'
    },
    Failed: {
      color: '#c23934',
      fontWeight: 'bold'
    },
    Completed: {
      color: 'rgb(75, 202, 129)',
      fontWeight: 'bold'
    }
  },
  log: {
    padding: '20px'
  }
}

const defaultResult = {
  status: 'Not Started',
  numberComponentsTotal: 0,
  numberComponentsDeployed: 0,
  numberComponentErrors: 0,
  numberTestsTotal: 0,
  numberTestsCompleted: 0,
  numberTestErrors: 0
}

class DeployToSandboxPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      sandbox: null,
      branches: [],
      branchToDeploy: 'master',
      messages: [],
      result: defaultResult
    }
  }

  render() {
    return (
      <div>
        <Header>
            <button 
              className="slds-button slds-button_brand"
              onClick={this.deploy.bind(this)}>
              Deploy
            </button>
        </Header>
        <ElectronBody>
          { this.state.branches.length === 0 ? 
            <Spinner /> : 
            <div>
              <div>
                <InputSelect 
                  label="Select Branch to Deploy"
                  onChange={branchToDeploy => {
                    this.setState({ branchToDeploy })
                  }}
                  required="true"
                  style={styles.input}
                  value={this.state.branchToDeploy} 
                  options={ this.state.branches } />
              </div>
              
              <Tabs>
                <Tab label="Summary">
                  <table className="slds-table slds-table_bordered slds-table_cell-buffer">
                    <tbody>
                      <tr>
                        <td style={styles.summaryStatName}>Status</td>
                        <td><span style={styles.summaryStatus[this.state.result.status]}>{convertCamelCaseStringToFormattedString(this.state.result.status)}</span></td>
                      </tr>
                      <tr>
                        <td style={styles.summaryStatName}>Total Components</td>
                        <td>{this.state.result.numberComponentsTotal}</td>
                      </tr>
                      <tr>
                        <td style={styles.summaryStatName}>Components Deployed</td>
                        <td>{this.state.result.numberComponentsDeployed}</td>
                      </tr>
                      <tr>
                        <td style={styles.summaryStatName}>Components with Errors</td>
                        <td>{this.state.result.numberComponentErrors}</td>
                      </tr>
                      <tr>
                        <td style={styles.summaryStatName}>Total Number of Tests</td>
                        <td>{this.state.result.numberTestsTotal}</td>
                      </tr>
                      <tr>
                        <td style={styles.summaryStatName}>Number of Successful Tests</td>
                        <td>{this.state.result.numberTestsCompleted}</td>
                      </tr>
                      <tr>
                        <td style={styles.summaryStatName}>Number of Failed Tests</td>
                        <td>{this.state.result.numberTestErrors}</td>
                      </tr>
                    </tbody>
                  </table>
                </Tab>
                <Tab label="Log">
                  <div style={styles.log}>
                      {
                        this.state.messages.map((m, i) => {
                          return (<div style={styles[m.type]} key={ i }>{ m.text }</div>)
                        })
                      }
                  </div>
                </Tab>
                <Tab label="Successes">
                  <table className="slds-table slds-table_bordered slds-table_cell-buffer">
                    <thead>
                      <tr className="slds-text-title_caps">
                        <th scope="col">
                          <div className="slds-truncate" title="Name">Name</div>
                        </th>
                        <th scope="col">
                          <div className="slds-truncate" title="Type">Type</div>
                        </th>
                        <th scope="col">
                          <div className="slds-truncate" title="Changed">Changed</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.result.details ? 
                          this.state.result.details.componentSuccesses ?
                            Array.isArray(this.state.result.details.componentSuccesses) ?
                              this.state.result.details.componentSuccesses.map(comp => {
                                return (
                                  <tr key={comp.fullName}>
                                    <td>
                                      <div className="slds-truncate" title={comp.fullName}>{decodeURIComponent(comp.fullName)}</div>
                                    </td>
                                    <td>
                                      <div className="slds-truncate" title={comp.componentType}>{comp.componentType}</div>
                                    </td>
                                    <td>
                                      <div className="slds-truncate" title={comp.changed}>{comp.changed}</div>
                                    </td>
                                  </tr>
                                )
                              }) :
                            <tr key={this.state.result.details.componentSuccesses.fullName}>
                              <td>
                                <div className="slds-truncate" title={this.state.result.details.componentSuccesses.fullName}>{this.state.result.details.componentSuccesses.fullName}</div>
                              </td>
                              <td>
                                <div className="slds-truncate" title={this.state.result.details.componentSuccesses.componentType}>{this.state.result.details.componentSuccesses.componentType}</div>
                              </td>
                              <td>
                                <div className="slds-truncate" title={this.state.result.details.componentSuccesses.changed}>{this.state.result.details.componentSuccesses.changed}</div>
                              </td>
                            </tr> :
                          null :
                        null}
                    </tbody>
                  </table>
                </Tab>
                <Tab label="Failures">
                  <table className="slds-table slds-table_bordered slds-table_cell-buffer">
                    <thead>
                      <tr className="slds-text-title_caps">
                        <th scope="col">
                          <div className="slds-truncate" title="Name">Name</div>
                        </th>
                        <th scope="col">
                          <div className="slds-truncate" title="Type">Type</div>
                        </th>
                        <th scope="col">
                          <div className="slds-truncate" title="Changed">Problem</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      { this.state.result.details ? 
                          this.state.result.details.componentFailures ?
                            Array.isArray(this.state.result.details.componentFailures) ?
                              this.state.result.details.componentFailures.map(comp => {
                                return (
                                  <tr key={comp.fullName}>
                                    <td>
                                      <div className="slds-truncate" title={comp.fullName}>{decodeURIComponent(comp.fullName)}</div>
                                    </td>
                                    <td>
                                      <div className="slds-truncate" title={comp.componentType}>{comp.componentType}</div>
                                    </td>
                                    <td>
                                      <div className="slds-truncate" title={comp.problem}>{comp.problem}</div>
                                    </td>
                                  </tr>
                                )
                              }) :
                            <tr key={this.state.result.details.componentFailures.fullName}>
                              <td>
                                <div className="slds-truncate" title={this.state.result.details.componentFailures.fullName}>{this.state.result.details.componentFailures.fullName}</div>
                              </td>
                              <td>
                                <div className="slds-truncate" title={this.state.result.details.componentFailures.componentType}>{this.state.result.details.componentFailures.componentType}</div>
                              </td>
                              <td>
                                <div className="slds-truncate" title={this.state.result.details.componentFailures.problem}>{this.state.result.details.componentFailures.problem}</div>
                              </td>
                            </tr> :
                          null :
                        null}
                    </tbody>
                  </table>
                </Tab>
              </Tabs>
            </div>
          }
        </ElectronBody>
      </div>
    )
  }

  componentWillMount() {
    ipcRenderer.send('deployToSandbox.getInitData')
    ipcRenderer.on('deployToSandbox.getInitData.response', (event, {sandbox, branches}) => {
      this.setState({
        sandbox,
        branches
      })
    })

    ipcRenderer.on('deployToSandbox.deploy.log', (event, message) => {
     
      console.log('New message', message)

      this.setState({
        messages: this.state.messages.concat(message)
      })
    })

    ipcRenderer.on('deployToSandbox.deploy.result', (event, result) => {

      console.log('New result', result)

      this.setState({
        result
      })
    })
  }

  deploy() {
    this.setState({
      result: defaultResult
    })
    
    ipcRenderer.send('deployToSandbox.deploy', this.state.branchToDeploy)
  }
}

ReactDOM.render(<DeployToSandboxPage />, root)


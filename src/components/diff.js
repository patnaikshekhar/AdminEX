import React from 'react'
import ReactDOM from 'react-dom'
import Header from './header.js'
import ElectronBody from './electronBody'

const {ipcRenderer} = require('electron')

let root = document.getElementById('root')

class DiffPage extends React.Component {
  
  constructor() {
    super()
    this.state = {
      diff: null
    }
  }

  render() {
    return (
      <div>
        <Header>
        </Header>
        <ElectronBody>
          <div dangerouslySetInnerHTML={{__html: this.state.diff}} />
        </ElectronBody>
      </div>
    )
  }

  componentWillMount() {
    ipcRenderer.send('getDiff')
    ipcRenderer.on('diff', (event, diff) => {
      this.setState({
        diff
      })
    })
  }
}

ReactDOM.render(<DiffPage />, root)


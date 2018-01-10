const {ipcRenderer, shell} = require('electron')
const path = require('path')

const run = () => {
  addButtonListeners()
  ipcRenderer.send('diffs')
}

const displayNoDiffs = () => {
  document.getElementById('mainTable').style.display = 'none'
  document.getElementById('commitButton').style.display = 'none'
  document.getElementById('noChanges').style.display = 'block'
}

const addButtonListeners = () => {
  document.getElementById('cancelButton').addEventListener('click', () => {
    ipcRenderer.send('diffResult', {
      status: 'cancel'
    })
  })

  document.getElementById('commitButton').addEventListener('click', () => {
    ipcRenderer.send('diffResult', {
      status: 'commit',
      message: document.getElementById('message').value
    })
  })
}

const createViewChangesButton = (data) => {
  const viewChangesButton = document.createElement('button')
  viewChangesButton.innerText = 'Diff'
  viewChangesButton.addEventListener('click', (e) => {
    e.preventDefault()
    ipcRenderer.send('getHTMLDiff', data)
  })
  viewChangesButton.className = 'slds-button slds-button_neutral'
  return viewChangesButton
}

ipcRenderer.on('htmlDiffResult', (e, data) => {
  console.log(data)
})

ipcRenderer.on('diffs', (event, {project, feature, data}) => {
  console.log(data)

  if (feature.name) {
    document.getElementById('message').value = feature.name + ' - Updated'
  }

  if (data) {
    if (data.length > 0) {
      data.forEach(row => {
        const tr = document.createElement('tr')
        
        const stateTd = document.createElement('td')
        stateTd.className = 'badge'
        stateTd.innerHTML = `<div class="slds-badge ${row.state}">${row.state}</div>`

        const nameTd = document.createElement('td')
        nameTd.innerText = row.fullName
        
        // const typeTd = document.createElement('td')
        // typeTd.innerText = row.type
        
        const locationTd = document.createElement('td')
        locationTd.innerHTML = `<a href="#">${row.filePath}</a>`
        locationTd.addEventListener('click', (e) => {
          e.preventDefault()
          shell.openItem(path.join(project.directory, row.filePath))
        })

        const buttons = document.createElement('td')
        buttons.appendChild(createViewChangesButton(row))
        console.log(buttons)

        tr.appendChild(stateTd)
        tr.appendChild(nameTd)
        // tr.appendChild(typeTd)
        tr.appendChild(locationTd)
        tr.appendChild(buttons)

        document.getElementById('changesList').appendChild(tr)
      })
    } else {
      displayNoDiffs()
    }
  } else {
    displayNoDiffs()
  }
})

module.exports = {
  run
}
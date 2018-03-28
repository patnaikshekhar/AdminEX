const {Notification, dialog} = require('electron')
const Settings = require('./settings')
const fs = require('fs')
const Constants = require('./constants')
const xml2json = require('xml2json')
const path = require('path')

const handleError = (msg, err) => {
  const error = err ? err.toString() : 'Unknown'
  log(error, 'Error')
  dialog.showMessageBox({
    type: 'error',
    title: 'An error has occured',
    message: msg,
    detail: error
  })
}

const alert = (msg) => {
  const notification = new Notification({
    title: 'Admin Experience',
    body: msg
  })

  notification.show()
}

const log = (msg, type) => {
  const d = new Date()
  const logMsg = `${d.toISOString()}\t${type ? type : 'Info'}\t${msg}`
  console.log(logMsg)
  appendToLogFile(`${logMsg}\n`)
}

const logp = (msg, type, data) => new Promise((resolve, reject) => {
  const d = typeof data == undefined ? '' : (typeof data == 'string' ? data : JSON.stringify(data))
  const message = `${msg} ${d}`
  log(message, type)
  resolve(data)
})

const logging = Settings().logging

const logFileName = (new Date()).toISOString().replace(/-/g, '_').replace(/:/g, '_').replace(/\./g, '_')
const logFilePath = `${Constants.MAIN_DIRECTORY}/adminex_${logFileName}.log`

const appendToLogFile = (data) => {
  if (logging) {
    if (fs.existsSync(logFilePath)) {
      fs.appendFile(logFilePath, data, (err) => {
        if (err)
          console.error(err)
      })
    } else {
      fs.writeFile(logFilePath, data, (err) => {
        if (err)
          console.error(err)
      })
    }
  }
}

const convertMetadataTypeStringToFormattedString = (str) => {
  console.log('convertMetadataTypeStringToFormattedString str',  Array.from(str).reduce((acc, value, index) => index > 0 && value.toUpperCase() === value ? acc + ' ' + value : acc + value, ''))
  return Array.from(str).reduce((acc, value, index) => index > 0 && value.toUpperCase() === value ? acc + ' ' + value : acc + value, '') 
}

const getMetadataTypeFromFileData = (data) => {
  try {
    const xml = xml2json.toJson(data)
    if (xml) {
      const keys = Object.keys(JSON.parse(xml))
      if (keys.length > 0) {
        return convertMetadataTypeStringToFormattedString(keys[0])
      }
    }
  } catch(e) {
  }

  return 'Unknown'
}

const getMetadataTypeForFile = (project, fileData) => new Promise((resolve, reject) => {
  fs.readFile(path.join(project.directory, fileData.filePath), (err, data) => {
    if (err) {
      resolve(Object.assign({}, fileData, {
        type: 'Unknown'
      }))
    } else {
      resolve(Object.assign({}, fileData, {
        type: getMetadataTypeFromFileData(data.toString())
      }))
    }
  })
})

module.exports = {
  handleError,
  alert,
  log,
  logp,
  getMetadataTypeForFile
}
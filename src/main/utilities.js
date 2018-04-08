const {Notification, dialog} = require('electron')
const Settings = require('./settings')
const fs = require('fs')
const Constants = require('./constants')
const xml2js = require('xml2js')
const xml2js_parser = new xml2js.Parser()
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
  return Array.from(str).reduce((acc, value, index) => index > 0 && value.toUpperCase() === value ? acc + ' ' + value : acc + value, '') 
}

const getMetadataTypeFromFileData = (data, callback) => {
  xml2js_parser.parseString(data, (err, xml) => {
    if (err) {
      callback('Unknown')
    } else {
      const keys = Object.keys(xml)
      if (keys.length > 0) {
        callback(convertMetadataTypeStringToFormattedString(keys[0]))
      }
    }
  })
}

const getMetadataTypeForFile = (project, fileData) => new Promise((resolve, reject) => {
  fs.readFile(path.join(project.directory, fileData.filePath), (err, data) => {
    if (err) {
      resolve(Object.assign({}, fileData, {
        type: 'Unknown'
      }))
    } else {
      getMetadataTypeFromFileData(data.toString(), (type) => {
        resolve(Object.assign({}, fileData, {
          type
        }))
      })
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
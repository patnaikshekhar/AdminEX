const {Notification, dialog} = require('electron')
const Settings = require('./settings')
const fs = require('fs')

const handleError = (msg, err) => {
  console.error(err)
  dialog.showMessageBox({
    type: 'error',
    title: 'An error has occured',
    message: msg,
    detail: err
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
  const logMsg = `${d.toISOString()}\t${type}\t${msg}\n`
  console.log(logMsg)
  appendToLogFile(logMsg)
}

const logFilePath = __dirname + '/' + Settings().logFile

const appendToLogFile = (data) => {
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

module.exports = {
  handleError,
  alert,
  log
}
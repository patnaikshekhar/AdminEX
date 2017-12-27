const {Notification} = require('electron')

const handleError = (err) => {
  console.error(err)
}

const alert = (msg) => {
  const notification = new Notification({
    title: 'Admin Experience',
    body: msg
  })

  notification.show()
}

module.exports = {
  handleError,
  alert
}
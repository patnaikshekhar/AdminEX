var settings = null
const fs = require('fs')
const SETTINGS_FILE = `${__dirname}/../../settings.json`

const Settings = () => {
  if (!settings) {
    const contents = fs.readFileSync(SETTINGS_FILE)
    settings = JSON.parse(contents.toString())
    return settings
  } else {
    return settings
  }
}

module.exports = Settings
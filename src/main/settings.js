var settings = null

const fs = require('fs')
const Constants = require('./constants')
const DEFAULT_SETTINGS_FILE = `${__dirname}/../../settings.json`
const SETTINGS_FILE = `${Constants.MAIN_DIRECTORY}/settings.json`

const Settings = () => {
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, fs.readFileSync(DEFAULT_SETTINGS_FILE).toString())
  }

  if (!settings) {
    const contents = fs.readFileSync(SETTINGS_FILE)
    settings = JSON.parse(contents.toString())
    return settings
  } else {
    return settings
  }
}

module.exports = Settings
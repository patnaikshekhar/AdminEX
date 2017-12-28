var settings = null
const fs = require('fs')

const Settings = () => {
  if (!settings) {
    const contents = fs.readFileSync(`${__dirname}/../../settings.json`)
    settings = JSON.parse(contents.toString())
    return settings
  } else {
    return settings
  }
}

module.exports = Settings
const keys = require('../../../keys.json')
const Constants = require('../constants')
const MAIN_DIRECTORY = Constants.MAIN_DIRECTORY
const uuid = require('uuid/v4')
const fs = require('fs')
const sfdx = require('../sfdx')

const getAuthURL = (isTest) => {
  return `${isTest ? keys.test_auth_url : keys.production_auth_url }?client_id=${keys.client_id}&redirect_uri=${keys.redirect_uri}&response_type=token`
}

const parseAuthURL = (url) => {
  const hashParams = {}
  let e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&;=]+)=?([^&;]*)/g,
    d = (s) => decodeURIComponent(s.replace(a, " ")),
    q = url

  while (e = r.exec(q))
    hashParams[d(e[1])] = d(e[2])

  return hashParams
}

const createAuthorisationFile = (name, url, isTest) => new Promise((resolve, reject) => {
  const parsedURL = parseAuthURL(url)
  const refreshToken = parsedURL['refresh_token']
  const instanceURL = parsedURL['instance_url']

  const fileName = `${MAIN_DIRECTORY}/${uuid()}.store`
  fs.writeFile(fileName, `force://${keys.client_id}:${keys.client_secret}:${refreshToken}@${instanceURL}`, (err) => {
    if (err) {
      reject(err)
    } else if (!isTest) {
      sfdx.authDevHubWithStore(name, fileName)
        .then((devhubAlias) => {
          fs.unlink(fileName, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve(devhubAlias)
            }
          })
        })
        .catch(e => reject(e))
    } else {
      resolve(fileName)
    }
  })
})
  

module.exports = {
  getAuthURL,
  createAuthorisationFile
}
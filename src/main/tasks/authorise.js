const keys = require('../../../keys.json')
const Constants = require('../constants')
const MAIN_DIRECTORY = Constants.MAIN_DIRECTORY
const uuid = require('uuid/v4')
const fs = require('fs')
const sfdx = require('../sfdx')
const { log } = require('../utilities')

const getAuthURL = (instanceURL) => {
  return `${instanceURL ? instanceURL : keys.production_auth_url }?client_id=${keys.client_id}&redirect_uri=${keys.redirect_uri}&response_type=token`
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

    log(`authTask.createAuthorisationFile finished writing store file ${fileName}`, 'Info')

    if (err) {
      reject(err)
    } else if (!isTest) {
      log(`authTask.createAuthorisationFile starting sfdx auth for ${name}`, 'Info')
      sfdx.authWithStore(name, fileName)
        .then(() => {
          log(`authTask.createAuthorisationFile deleting auth file ${fileName}`, 'Info')
          fs.unlink(fileName, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve(name)
            }
          })
        })
        .catch(e => reject(e))
    } else {
      resolve(fileName)
    }
  })
})

const startAuth = (window, alias, instanceURL) => new Promise((resolve, reject) => {

  log(`authTask.startAuth Starting auth for instance ${instanceURL} and alias ${alias}`, 'Info')

  if (instanceURL === 'test') {
    window.loadURL(getAuthURL(keys.test_auth_url))
  } else if (!instanceURL) {
    window.loadURL(getAuthURL(keys.production_auth_url))
  } else {
    window.loadURL(getAuthURL(`${instanceURL}${keys.generic_auth_url}`))
  }

  window.webContents.on('will-navigate', (event, url) => {
    if (url.indexOf(keys.redirect_uri) > -1) {
      log(`authTask.startAuth at callback URL for alias ${alias}`, 'Info')

      createAuthorisationFile(alias, url)
        .then(() => {
          log(`authTask.startAuth finished createAuthorisationFile for alias ${alias}`, 'Info')
          resolve(alias)
        })
        .catch(e => {
          log(`authTask.startAuth error in createAuthorisationFile ${e.toString()}`, 'Error')
          reject(e)
        })
    }
  })
})

module.exports = {
  getAuthURL,
  createAuthorisationFile,
  startAuth
}
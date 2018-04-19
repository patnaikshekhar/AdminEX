const keys = require('../../keys.json')
const { log } = require('./utilities')
const request = require('request-promise')
const url = require('url')
const querystring = require('querystring')

const getAuthURL = () => {
  return `${keys.heroku_auth_url}?client_id=${keys.heroku_client_id}&redirect_uri=${keys.heroku_redirect_uri}&response_type=code&scope=global`
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

const startAuth = (window, project) => new Promise((resolve, reject) => {

  log(`heroku.startAuth Starting auth for project ${project.name}`, 'Info')
  log(`Navigating to ${getAuthURL()}`, 'Info')
  
  window.webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
    if (newURL.indexOf(keys.heroku_redirect_uri) > -1) {
      const queryString = url.parse(newURL).query
      const code = querystring.parse(queryString)['code']

      log(`heroku.startAuth at callback URL for project ${project.name} code is ${code}`, 'Info')
      request.post(keys.heroku_token_url, {
        form: {
          client_secret: keys.heroku_client_secret,
          grant_type: 'authorization_code',
          code
        }
      }).then((response) => {
        const res = JSON.parse(response)
        resolve(res)
      }).catch(e => reject(e))
    }
  })

  // window.webContents.on('will-navigate', (event, url) => {
  //   console.log(url)
    
  // })

  window.loadURL(getAuthURL())
  
})

const getRegions = (access_token) => {

  log(`heroku.getRegions started`, 'Info')

  return (
    request.get('https://api.heroku.com/regions', {
      headers: {
        Accept: 'application/vnd.heroku+json; version=3',
        Authorization: `Bearer ${access_token}`
      }
    }).then((res) => {
      log(`heroku.getRegions ended ${res}`, 'Info')
      const response = JSON.parse(res)
      log(`heroku.getRegions ended ${JSON.stringify(response.map(region => region.name))}`, 'Info')
      return response.map(region => region.name)

    })
  )
}

module.exports = {
  startAuth,
  getRegions
}
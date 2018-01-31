const sfdx = require('../sfdx')
const {logp} = require('../utilities')

const openScratchOrg = (alias) => {
  return sfdx.openScratchOrg({ alias })
    .then(options => logp('Finished openScratchOrg', 'Info', options))
}

module.exports = openScratchOrg
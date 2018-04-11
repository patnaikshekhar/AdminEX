const authTask = require('../src/main/tasks/authorise')
const fs = require('fs')

describe('authorise', () => {
  describe('createAuthorisationFile', () => {
    it('should generate a file with the accessand refresh token', (done) => {
      const url = 'adminex://main#access_token=00D1r000000eX6d%21AQUAQDtkT1ktaJ9JvtyS1PHNzglrrGAk6lTw6eHazjluYRkqp0QbEiZkl5qxftjLCOs1uIKEgm8_aknPKAOi2AciRUkYlss2&refresh_token=5Aep861Rf8_Ow06KaLF97xf8s3e1p8ZlQ1WAPjPoLJpYeKz4TeNmqR.QpK8HHH76_BGgyF_XakHdcPRFG8ohgPC&instance_url=https%3A%2F%2Fbattlestar-enterprise-89042.my.salesforce.com&id=https%3A%2F%2Flogin.salesforce.com%2Fid%2F00D1r000000eX6dEAE%2F0051r00000748TWAAY&issued_at=1523363207314&signature=8vyjG9qxEeXnEc5arnFvyPFRt04%2BoZPOvD1abZ6osOw%3D&scope=full+refresh_token&token_type=Bearer'
      authTask.createAuthorisationFile('test', url, true)
        .then(fileName => {
          fs.readFile(fileName, (err, contents) => {
            if (err) {
              expect(err).toBe(null)
              done()
            } else {
              expect(contents.toString()).toBe('force://5Aep861Rf8_Ow06KaLF97xf8s3e1p8ZlQ1WAPjPoLJpYeKz4TeNmqR.QpK8HHH76_BGgyF_XakHdcPRFG8ohgPC@https://battlestar-enterprise-89042.my.salesforce.com')
              done()
            }
          })
        })
        .catch(e => {
          expect(e).toBe(null)
          done()
        })
    })
  })
})
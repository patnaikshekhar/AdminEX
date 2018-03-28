const Utilties = require('../src/main/utilities')

describe('utilties', () => {
  describe('getMetadataTypeForFile', () => {
    it('should get the metadata type for a file', (done) => {
      Utilties.getMetadataTypeForFile('/Users/spatnaik/Desktop/PleaseDelete3/force-app/main/default/layouts/Account-Account %28Marketing%29 Layout.layout-meta.xml')
        .then(data => {
          console.log(data)
        })
    })
  })
})
const Utilties = require('../src/main/utilities')
const fs = require('fs')
const TEMP_DIR = './tmp'

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR)
}

describe('utilties', () => {
  describe('getMetadataTypeForFile', () => {
    it('should get the metadata type for a file', (done) => {

      const sampleFile = `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>Level__c</fullName>
          <description>This is a sample field</description>
          <externalId>false</externalId>
          <label>Level</label>
          <length>255</length>
          <required>false</required>
          <trackFeedHistory>false</trackFeedHistory>
          <type>Text</type>
          <unique>false</unique>
      </CustomField>
      `

      const fileName = `${TEMP_DIR}/utiltiesSpec1.xml`
      fs.writeFileSync(fileName, sampleFile)

      Utilties.getMetadataTypeForFile({ directory: './tmp'}, { filePath: 'utiltiesSpec1.xml' })
        .then(data => {
          expect(data.type).toBe('Custom Field')
          done()
        })
        .catch(e => {
          expect(e.toString()).not.toBe(null)
          done()
        })
    })

    it('should return unknown if file is wierd', (done) => {

      const sampleFile = `
      {
        "what": "is this"
      }
      `

      const fileName = `${TEMP_DIR}/utiltiesSpec2.xml`
      fs.writeFileSync(fileName, sampleFile)

      Utilties.getMetadataTypeForFile({ directory: './tmp'}, { filePath: 'utiltiesSpec2.xml' })
        .then(data => {
          expect(data.type).toBe('Unknown')
          done()
        })
        .catch(e => {
          expect(e.toString()).not.toBe(null)
          done()
        })
    })
  })
})
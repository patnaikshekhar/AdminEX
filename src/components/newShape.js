import React from 'react'
import InputSelect from './inputSelect'
import InputText from './inputText'
import MultiSelect from './multiSelect'

const fs = require('fs')

const NewShape = (props) => {

  return (
    <div className="slds-grid slds-grid_pull-padded-medium" style={styles.main}>

      <div className="slds-col slds-size_1-of-2 slds-p-horizontal_medium">

        <InputText 
          label="Org Name"
          value={props.shape.orgName} 
          onChange={v => props.onShapeDataChange(Object.assign(props.shape, {
            orgName: v 
          }))} 
          style={styles.inputStyles} />

        <MultiSelect 
          label="Enabled Preferences"
          options={props.prefs}
          onSelectionChanged={enabledPrefs => props.onShapeDataChange(Object.assign(props.shape, {
            orgPreferences: Object.assign(props.shape.orgPreferences, {
              enabled: enabledPrefs
            }) 
          }))}
          selected={props.shape.orgPreferences.enabled} 
          style={styles.inputStyles} />

        <MultiSelect 
          label="Features"
          options={props.features}
          onSelectionChanged={features => props.onShapeDataChange(Object.assign(props.shape, {
            features 
          }))}
          selected={props.shape.features} 
          style={styles.inputStyles} />
      </div>
      
      <div className="slds-col slds-size_1-of-2 slds-p-horizontal_medium">
        
        <InputSelect 
          label="Edition"
          value={props.shape.edition} 
          options={['Developer', 'Enterprise', 'Group', 'Professional']}
          onChange={v => props.onShapeDataChange(Object.assign(props.shape, {
            edition: v 
          }))} 
          style={styles.inputStyles} />

        <MultiSelect 
          label="Disabled Preferences"
          options={props.prefs}
          onSelectionChanged={disabledPrefs => props.onShapeDataChange(Object.assign(props.shape, {
            orgPreferences: Object.assign(props.shape.orgPreferences, {
              disabled: disabledPrefs
            }) 
          }))}
          selected={props.shape.orgPreferences.disabled} 
          style={styles.inputStyles} />
        </div>
    </div>
  )
}

const styles = {
  main: {
    paddingLeft: 15,
    paddingRight: 15
  },

  inputStyles: {
    marginBottom: '50px',
    marginTop: '15px'
  }
}

export default NewShape
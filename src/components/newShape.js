import React from 'react'
import InputSelect from './inputSelect'
import InputText from './inputText'
import MultiSelect from './multiSelect'

const fs = require('fs')

const NewShape = (props) => {

  const features = JSON.parse(fs.readFileSync('./scratch_org_features.json').toString())
  const prefs = JSON.parse(fs.readFileSync('./scratch_org_preferences.json').toString())

  return (
    <div className="slds-grid slds-grid_pull-padded-medium" style={styles.main}>

      <div className="slds-col slds-p-horizontal_medium">
        <InputSelect 
          label="Edition"
          value={props.shape.edition} 
          options={['Developer', 'Enterprise', 'Group', 'Professional']}
          onChange={v => props.onShapeDataChange(Object.assign(props.shape, {
            edition: v 
          }))} />

        <MultiSelect 
          label="Enabled Preferences"
          options={prefs}
          onSelectionChanged={enabledPrefs => props.onShapeDataChange(Object.assign(props.shape, {
            enabledPrefs 
          }))}
          selected={props.shape.enabledPrefs} />
      </div>
      
      <div className="slds-col slds-p-horizontal_medium">
        
        <MultiSelect 
          label="Features"
          options={features}
          onSelectionChanged={features => props.onShapeDataChange(Object.assign(props.shape, {
            features 
          }))}
          selected={props.shape.features} />

        <MultiSelect 
          label="Disabled Preferences"
          options={prefs}
          onSelectionChanged={disabledPrefs => props.onShapeDataChange(Object.assign(props.shape, {
            disabledPrefs 
          }))}
          selected={props.shape.disabledPrefs} />
        </div>
    </div>
  )
}

const styles = {
  main: {
    paddingLeft: 15,
    paddingRight: 15
  }
}

export default NewShape
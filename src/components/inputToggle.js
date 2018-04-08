import React from 'react'

const InputToggle = (props) => {
  return (
    <div className="slds-form-element" style={props.style}>
      <label className="slds-checkbox_toggle slds-grid">
        <span className="slds-form-element__label slds-m-bottom_none">{props.label}</span>
        <input 
          type="checkbox"
          aria-describedby="toggle-desc" 
          checked={props.value} 
          onChange={ (e) => props.onChange(!props.value) } />
        <span  className="slds-checkbox_faux_container" aria-live="assertive">
          <span className="slds-checkbox_faux"></span>
          <span className="slds-checkbox_on">{props.enabledLabel}</span>
          <span className="slds-checkbox_off">{props.disabledLabel}</span>
        </span>
      </label>
    </div>
  )
}

export default InputToggle
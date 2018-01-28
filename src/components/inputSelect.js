import React from 'react'

export default (props) => 
  <div className="slds-form-element" style={props.style}>
    <label className="slds-form-element__label">{ props.label }</label>
    <div className="slds-form-element__control">
        <select 
          className="slds-select"
          value={props.value}
          onChange={ (e) => props.onChange(e.target.value) }>
          {props.options.map(option => 
            <option key={option}>{ option }</option>
          )}
        </select>
    </div>
  </div>
import React from 'react'
const {dialog} = require('electron').remote

const inputStyle = {
  width: '92%',
  marginLeft: '4px'
}

export default (props) => 
  <div className="slds-form-element" style={props.style}>
    <label className="slds-form-element__label">{ props.label }
      {props.required ? <abbr className="slds-required" title="required">*</abbr> : '' }
    </label>
    <div className="slds-form-element__control">
      <input 
        type="text" 
        className="slds-input" 
        onChange={e => props.onChange(e.target.value)}
        placeholder={ props.placeholder } 
        value={props.value} 
        style={inputStyle} />
      <button className="slds-button slds-button_icon slds-button_icon-border-filled" title="Open Folder" onClick={() => {
          const directory = dialog.showOpenDialog({properties: [props.type]})
          props.onChange(directory)
        }}>
        <svg className="slds-button__icon" aria-hidden="true">
          <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="../lib/salesforce-lightning-design-system-2.4.6/assets/icons/utility-sprite/svg/symbols.svg#opened_folder" />
        </svg>
        <span className="slds-assistive-text">Open Folder</span>
      </button>
    </div>
  </div>
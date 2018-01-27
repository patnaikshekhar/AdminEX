import React from 'react'

const styles = {
  marginBottom: '25px',
  padding: '20px',
  marginTop: '20px'
}

export default (props) => 
  <div className="slds-form-element" style={styles}>
    <label className="slds-form-element__label">{ props.label }</label>
    <div className="slds-form-element__control">
      <input 
        type="text" 
        className="slds-input" 
        value={props.value}
        placeholder={ props.placeholder } 
        onChange={ (e) => props.onChange(e.target.value) }/>
    </div>
  </div>
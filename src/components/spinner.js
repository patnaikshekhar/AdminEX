import React from 'react'

const Spinner = (props) => {
  return (
    <div role="status" className="slds-spinner slds-spinner_brand slds-spinner_large">
      <span className="slds-assistive-text">Loading</span>
      <div className="slds-spinner__dot-a"></div>
      <div className="slds-spinner__dot-b"></div>
    </div>
  )
}

export default Spinner
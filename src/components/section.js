import React from 'react'

const Section = (props) => {
  return (
    <div className="slds-section slds-is-open">
      <h3 className="slds-section__title">
        <button aria-controls="expando-unique-id" aria-expanded="true" className="slds-button slds-section__title-action">
          <span className="slds-truncate" title="Section Title">{ props.title }</span>
        </button>
      </h3>
      <div aria-hidden="false" className="slds-section__content" id="expando-unique-id">
        { props.children }
      </div>
    </div>
  )
}

export default Section
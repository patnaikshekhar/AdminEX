import React from 'react'

const iconMapping = {
  warning: 'warning',
  offline: 'offline',
  error: 'ban'
}

export default (props) => 
  <div 
    className={`slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_${props.type}`} 
    role="alert">
    <span className="slds-assistive-text">{props.type}</span>
    <span className="slds-icon_container slds-icon-utility-warning slds-m-right_x-small" title="Description of icon when needed">
      <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
        <use 
          xmlnsXlink="http://www.w3.org/1999/xlink" 
          xlinkHref={`../lib/salesforce-lightning-design-system-2.4.6/assets/icons/utility-sprite/svg/symbols.svg#${iconMapping[props.type]}`} />
      </svg>
    </span>
    { props.children }
  </div>
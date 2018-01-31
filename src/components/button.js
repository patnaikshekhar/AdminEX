import React from 'react'

const Button = (props) => {

  let type = 'neutral'
  
  if (props.type) {
    type = props.type
  }

  const classes = 
    `slds-button ${props.icon ? 'slds-button_icon slds-button_icon-border-filled' : 'slds-button_' + type}`

  const iconCategory = props.icon ? props.icon.split(':')[0] : null
  const iconName = props.icon ? props.icon.split(':')[1] : null

  return (
    <button className={classes} onClick={props.onClick}>
      {props.icon ? 
        <svg className="slds-button__icon" aria-hidden="true">
          <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={`../lib/salesforce-lightning-design-system-2.4.6/assets/icons/${iconCategory}-sprite/svg/symbols.svg#${iconName}`} />
        </svg> : 
        ''
      }
      {props.children}
    </button>
  )
}

export default Button
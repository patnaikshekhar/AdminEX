import React from 'react'

const styles = {
  paddingTop: '50px',
  paddingBottom: '40px'
}

export default (props) =>
  <header className="slds-global-header_container">
    <a href="javascript:void(0);" className="slds-assistive-text slds-assistive-text_focus">Skip to Navigation</a><a href="javascript:void(0);" className="slds-assistive-text slds-assistive-text_focus">Skip to Main Content</a>
    <div style={styles} className="slds-global-header slds-grid slds-grid_align-spread">
      <div className="slds-global-header__item">
        <div className="slds-global-header__logo">
          <img src="../lib/salesforce-lightning-design-system-2.4.6/assets/images/logo-noname.svg" alt="" />
        </div>
      </div>
      <div className="slds-global-header__item slds-grid_vertical-align-center">
        Admin Experience
      </div>
      <ul className="slds-global-header__item slds-grid slds-grid_vertical-align-center">
        { React.Children.toArray(props.children).map((child, i) => 
          <li key={i} className="slds-dropdown-trigger slds-dropdown-trigger_click slds-p-horizontal_xxx-small project-select">
            { child }
          </li>
        ) }
      </ul>
    </div>
  </header>
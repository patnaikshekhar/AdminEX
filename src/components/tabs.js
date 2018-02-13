import React from 'react'
import Tab from './tab'

class Tabs extends React.Component {
  constructor() {
    super()
    this.state = {
      active: 0
    }
  }

  render() {
    const tabs = this.props.children.filter(e => e.type == Tab)

    return (
      <div className="slds-tabs_default">
        <ul className="slds-tabs_default__nav" role="tablist">
          { tabs.map((tab, index) => {
            return (
              <li 
                key={index}
                className={`slds-tabs_default__item ${this.state.active == index ? 'slds-is-active' : ''}`} 
                title={tab.props.label} role="presentation"
                onClick={() => {
                  this.setState({
                    active: index
                  })
                  if (this.props.onTabChange) {
                    this.props.onTabChange(index)
                  }
                }}>
                <a 
                  className="slds-tabs_default__link" 
                  href="javascript:void(0);" 
                  role="tab" 
                  tabIndex={index}>{tab.props.label}</a>
              </li>
            )
          })}
        </ul>
        <div
          className="slds-tabs_default__content slds-show" 
          role="tabpanel">{ 
            tabs.length > 0 ? 
            tabs[this.state.active].props.children : 
            '' 
          }</div>
      </div>
    )
  }
}

export default Tabs
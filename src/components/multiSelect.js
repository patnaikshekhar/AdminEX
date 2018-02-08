import React from 'react'

const SearchBox = (props) => {
  return (
    <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right">
      <input 
        type="text" 
        className="slds-input slds-combobox__input" 
        autoComplete="off" 
        placeholder={ props.placeholder } 
        onChange={props.onChange} 
        onFocus={props.onFocus}
        onBlur={props.onBlur} />
      <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_right">
        <svg className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" >
          <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="/lib/salesforce-lightning-design-system-2.4.6/assets/icons/utility-sprite/svg/symbols.svg#search" />
        </svg>
      </span>
    </div>
  )
}

class MutiSelect extends React.Component {

  state = {
    searchText: '',
    showOptions: false
  }

  onTextFocus() {
    this.setState({
      showOptions: true
    })
  }

  onTextLoseFocus() {
    this.setState({
      showOptions: false
    })
  }

  searchTextChanged(e) {
    this.setState({
      searchText: e.target.value
    })
  }

  render() {

    const filteredOptions = this.props.options.filter(option => 
      option.indexOf(this.state.searchText) > -1
    )

    return (
      <div style={{height: '10rem'}}>
        <div className="slds-form-element">
          <label className="slds-form-element__label" htmlFor="combobox-unique-id-5">{ this.props.label }</label>
          <div className="slds-form-element__control">
            <div className="slds-combobox_container slds-has-object-switcher">
              <div className={`slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.state.showOptions ? 'slds-is-open' : ''}`}>
                <SearchBox 
                  onChange={this.searchTextChanged.bind(this)} 
                  placeholder={this.props.placeholder} 
                  onFocus={this.onTextFocus.bind(this)} 
                  onBlur={this.onTextLoseFocus.bind(this)} />
                <div>
                  <ul className="slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_fluid" style={styles.dropdownContainer}>
                    {filteredOptions.map(option => {
                      return (
                        <MutiSelectOption 
                          key={option}
                          name={option} 
                          icon={this.props.icon} />
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const MutiSelectOption = (props) => {

  const icon = props.icon ? props.icon : 'account'

  return (
    <li className="slds-listbox__item">
      <div className="slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta">
        <span className="slds-media__figure">
          <span className={`slds-icon_container slds-icon-standard-${icon}`} title="Description of icon when needed">
            <svg className="slds-icon slds-icon_small" >
              <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref={`/lib/salesforce-lightning-design-system-2.4.6/assets/icons/standard-sprite/svg/symbols.svg#${icon}`} />
            </svg>
            <span className="slds-assistive-text">{ props.name }</span>
          </span>
        </span>
        <span className="slds-media__body">
          <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">{ props.name }</span>
        </span>
      </div>
    </li>
  )
}

const styles = {
  dropdownContainer: {
    overflowY: 'scroll',
    maxHeight: 200
  }
}

export default MutiSelect


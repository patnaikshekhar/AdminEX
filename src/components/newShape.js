import React from 'react'
import InputSelect from './inputSelect'
import InputText from './inputText'
import MultiSelect from '@khanacademy/react-multi-select'

const NewShape = (props) => {
  return (
    <div>
      <InputText
        label="Name" 
        value={props.shape.name}
        onChange={v => props.onShapeDataChange(Object.assign(props.shape, {
          name: v 
        }))} />
      
      <InputSelect 
        label="Edition"
        value={props.shape.edition} 
        options={['Developer', 'Enterprise', 'Group', 'Professional']}
        onChange={v => props.onShapeDataChange(Object.assign(props.shape, {
          edition: v 
        }))} />

      <MultiSelect 
        options={['Developer', 'Enterprise', 'Group', 'Professional']}
        onSelectedChanged={v => props.onShapeDataChange(Object.assign(props.shape, {
          features: v 
        }))}
        selected={props.shape.features}
        />
    </div>
  )
}

export default NewShape
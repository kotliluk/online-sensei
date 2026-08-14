import { JSX } from 'react'
import ReactComponent from '../../assets/svg/cross.svg?react'
import { IconProps } from './iconProps'


export const Cross = (props: IconProps): JSX.Element => {
  return <ReactComponent {...props} />
}

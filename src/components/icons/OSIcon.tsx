import { JSX } from 'react'
import ReactComponent from '../../assets/svg/os_icon.svg?react'
import { IconProps } from './iconProps'


export const OSIcon = (props: IconProps): JSX.Element => {
  return <ReactComponent {...props} />
}

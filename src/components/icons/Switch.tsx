import { JSX } from 'react'
import ReactComponent from '../../assets/svg/switch.svg?react'
import { IconPropsWithFill } from './iconProps'


export const Switch = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

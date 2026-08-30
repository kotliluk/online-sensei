import { JSX } from 'react'
import ReactComponent from '../../assets/svg/cross.svg?react'
import { IconPropsWithFill } from './iconProps'


export const Cross = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

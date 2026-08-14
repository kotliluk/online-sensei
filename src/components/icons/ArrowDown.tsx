import { JSX } from 'react'
import ReactComponent from '../../assets/svg/arrow_down.svg?react'
import { IconPropsWithFill } from './iconProps'


export const ArrowDown = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

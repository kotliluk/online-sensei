import { JSX } from 'react'
import ReactComponent from '../../assets/svg/arrow_up.svg?react'
import { IconPropsWithFill } from './iconProps'


export const ArrowUp = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

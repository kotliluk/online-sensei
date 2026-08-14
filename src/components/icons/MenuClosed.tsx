import { JSX } from 'react'
import ReactComponent from '../../assets/svg/menu_closed.svg?react'
import { IconPropsWithFill } from './iconProps'


export const MenuClosed = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

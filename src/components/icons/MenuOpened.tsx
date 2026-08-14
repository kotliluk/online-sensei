import { JSX } from 'react'
import ReactComponent from '../../assets/svg/menu_opened.svg?react'
import { IconPropsWithFill } from './iconProps'


export const MenuOpened = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

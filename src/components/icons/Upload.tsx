import { JSX } from 'react'
import ReactComponent from '../../assets/svg/upload.svg?react'
import { IconPropsWithFill } from './iconProps'


export const Upload = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

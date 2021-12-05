// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { ReactComponent } from '../../assets/svg/os_icon.svg'
import { IconProps } from './iconProps'


export const OSIcon = (props: IconProps): JSX.Element => {
  return <ReactComponent {...props} />
}

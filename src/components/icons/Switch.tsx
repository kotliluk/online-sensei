// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { ReactComponent } from '../../assets/svg/switch.svg'
import { IconPropsWithFill } from './iconProps'


export const Switch = (props: IconPropsWithFill): JSX.Element => {
  return <ReactComponent {...props} />
}

import { JSX } from 'react'
import { IconPropsWithFill } from './iconProps'
import { ArrowUp } from './ArrowUp'
import { ArrowDown } from './ArrowDown'


interface OrderArrowProps extends IconPropsWithFill {
  order: 'asc' | 'desc'
}

export const OrderArrow = ({ order, ...props }: OrderArrowProps): JSX.Element => {
  return order === 'asc' ? <ArrowUp {...props} /> : <ArrowDown {...props} />
}

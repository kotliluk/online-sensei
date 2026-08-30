import { JSX, ReactNode } from 'react'
import './Button.scss'


interface ButtonProps {
  'className'?: string
  'onClick'?: () => void
  'disabled'?: boolean
  'children'?: ReactNode
  // a button whose whole label is an icon has no accessible name without one
  'aria-label'?: string
  // lets a list find one of its own buttons again after the list has been reordered
  'data-move'?: string
}

export const Button = (props: ButtonProps): JSX.Element => {
  const { className, children, ...other } = props

  return (
    <button className={`__button ${className ?? ''}`} {...other}>
      {children}
    </button>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { ReactNode, useCallback } from 'react'
import './Button.scss'


interface ButtonProps {
  className?: string
  onClick?: () => void
  disabled?: boolean
  children?: ReactNode
}

export const Button = (props: ButtonProps): JSX.Element => {
  const { className, children, ...other } = props

  return (
    <button className={`__button ${className ?? ''}`} {...other}>
      {children}
    </button>
  )
}

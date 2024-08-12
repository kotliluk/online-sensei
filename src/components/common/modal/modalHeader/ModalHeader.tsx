// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import './ModalHeader.scss'
import { useCloseModal } from '../../../../logic/hooks/useCloseModal'
import { Cross } from '../../../icons/Cross'
import { Button } from '../../../atoms/button/Button'


interface ModalHeaderProps {
  heading: string
}

export const ModalHeader = (props: ModalHeaderProps): JSX.Element | null => {
  const close = useCloseModal()

  return (
    <header className='modal-header'>
      <h1>{props.heading}</h1>
      <Button onClick={close}>
        <Cross />
      </Button>
    </header>
  )
}

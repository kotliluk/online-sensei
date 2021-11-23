// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'


export const PageHeader = (): JSX.Element => {

  return (
    <header className='page-header'>
      <Link to='/'>OnlineSensei</Link>
    </header>
  )
}

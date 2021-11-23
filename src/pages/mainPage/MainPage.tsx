// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Link } from 'react-router-dom'


export const MainPage = (): JSX.Element => {

  return (
    <main className='main-page'>
      Main Page
      <Link to='/reactions'>Reactions</Link>
    </main>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Link } from 'react-router-dom'
import './MainPage.scss'


export const MainPage = (): JSX.Element => {

  return (
    <main className='main-page'>
      <h1>OnlineSensei</h1>
      <p>Train alone or with friends with OnlineSensei!</p>

      <h2>Available features:</h2>

      <div className='feature-card'>
        <p className='feature-text'>Train your reactions with customizable timer with random signals</p>
        <Link className='feature-link' to='/reactions'>Reactions</Link>
      </div>

      <div className='feature-card'>
        <p className='feature-text'>Take your friend for kumite fight with easy-to-use kumite timer</p>
        <Link className='feature-link' to='/kumite-timer'>Kumite timer</Link>
      </div>
    </main>
  )
}

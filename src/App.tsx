// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { MainPage } from './pages/mainPage/MainPage'


const App = (): JSX.Element => {
  return (
    <Switch>
      <Route path='/login'>
        <div>Login</div>
      </Route>
      <Route path='*'>
        <MainPage />
      </Route>
    </Switch>
  )
}

export default App

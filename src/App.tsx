// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { MainPage } from './pages/mainPage/MainPage'
import { PageHeader } from './components/common/pageHeader/PageHeader'
import { ReactionsPage } from './pages/reactionsPage/ReactionsPage'


const App = (): JSX.Element => {
  return (
    <div className='app'>
      <PageHeader />
      <Switch>
        <Route path='/reactions'>
          <ReactionsPage />
        </Route>
        <Route path='/' exact>
          <MainPage />
        </Route>
        <Route path='*'>
          <Redirect to='/' />
        </Route>
      </Switch>
    </div>
  )
}

export default App

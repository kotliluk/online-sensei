// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { PageHeader } from './components/common/pageHeader/PageHeader'
import { MainPage } from './pages/main/MainPage'
import { ReactionsPage } from './pages/reactions/ReactionsPage'
import { KumiteTimerPage } from './pages/kumiteTimer/KumiteTimerPage'
import { useSelector } from './redux/useSelector'
import { selectTheme } from './redux/page/selector'


const App = (): JSX.Element => {
  const theme = useSelector(selectTheme)

  return (
    <div className={`app theme theme--${theme}`}>
      <PageHeader />
      <Switch>
        <Route path='/reactions'>
          <ReactionsPage />
        </Route>
        <Route path='/kumite-timer'>
          <KumiteTimerPage />
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { KumiteTimerSetUpScreen } from '../../components/kumiteTimer/kumiteTimerSetUpScreen/KumiteTimerSetUpScreen'
import { KumiteTimerScreen } from '../../components/kumiteTimer/kumiteTimerScreen/KumiteTimerScreen'


export const KumiteTimerPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path='/kumite-timer/set-up' exact>
        <KumiteTimerSetUpScreen />
      </Route>
      <Route path='/kumite-timer/set-up/*'>
        <Redirect to='/kumite-timer/set-up' />
      </Route>
      <Route path='/kumite-timer/' exact>
        <KumiteTimerScreen />
      </Route>
      <Route path='/kumite-timer/*'>
        <Redirect to='/kumite-timer/' />
      </Route>
    </Switch>
  )
}
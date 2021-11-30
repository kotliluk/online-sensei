// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ReactionsScreen } from '../../components/reactions/reactionsScreen/ReactionsScreen'
import { ReactionsSetUpScreen } from '../../components/reactions/reactionsSetUpScreen/ReactionsSetUpScreen'


export const ReactionsPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path='/reactions/set-up' exact>
        <ReactionsSetUpScreen />
      </Route>
      <Route path='/reactions/set-up/*'>
        <Redirect to='/reactions/set-up' />
      </Route>
      <Route path='/reactions/' exact>
        <ReactionsScreen />
      </Route>
      <Route path='/reactions/*'>
        <Redirect to='/reactions/' />
      </Route>
    </Switch>
  )
}

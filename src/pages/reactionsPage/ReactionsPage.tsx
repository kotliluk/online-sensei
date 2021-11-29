// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { SetUpReactionsScreen } from '../../components/reactionsPage/setUpReactionsScreen/SetUpReactionsScreen'
import { PlayReactionsScreen } from '../../components/reactionsPage/playReactionsScreen/PlayReactionsScreen'


export const ReactionsPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path='/reactions/set-up' exact>
        <SetUpReactionsScreen />
      </Route>
      <Route path='/reactions/set-up/*'>
        <Redirect to='/reactions/set-up' />
      </Route>
      <Route path='/reactions/' exact>
        <PlayReactionsScreen />
      </Route>
      <Route path='/reactions/*'>
        <Redirect to='/reactions/' />
      </Route>
    </Switch>
  )
}

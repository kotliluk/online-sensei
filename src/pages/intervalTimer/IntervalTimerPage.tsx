// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { SetUpScreen } from '../../components/intervalTimer/setUpScreen/SetUpScreen'
import { IntervalTimerScreen } from '../../components/intervalTimer/intervalTimerScreen/IntervalTimerScreen'


const PAGE_PATH = 'interval-timer'

export const IntervalTimerPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path={`/${PAGE_PATH}/set-up`} exact>
        <SetUpScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/set-up/*`}>
        <Redirect to={`/${PAGE_PATH}/set-up`} />
      </Route>
      <Route path={`/${PAGE_PATH}`} exact>
        <IntervalTimerScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/*`}>
        <Redirect to={`/${PAGE_PATH}`} />
      </Route>
    </Switch>
  )
}

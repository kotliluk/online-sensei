// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { SetUpScreenSimple } from '../../components/intervalTimer/setUpScreenSimple/SetUpScreenSimple'
import { IntervalTimerScreen } from '../../components/intervalTimer/intervalTimerScreen/IntervalTimerScreen'
import { SetUpScreenAdvanced } from '../../components/intervalTimer/setUpScreenAdvanced/SetUpScreenAdvanced'


const PAGE_PATH = 'interval-timer'

export const IntervalTimerPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path={`/${PAGE_PATH}/set-up-advanced`} exact>
        <SetUpScreenAdvanced />
      </Route>
      <Route path={`/${PAGE_PATH}/set-up-advanced/*`}>
        <Redirect to={`/${PAGE_PATH}/set-up-advanced`} />
      </Route>
      <Route path={`/${PAGE_PATH}/set-up`} exact>
        <SetUpScreenSimple />
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { SetUpScreen } from '../../components/kumiteTimer/setUpScreen/SetUpScreen'
import { KumiteTimerScreen } from '../../components/kumiteTimer/kumiteTimerScreen/KumiteTimerScreen'
import { KumiteTimerMirror } from '../../components/kumiteTimer/kumiteTimerScreen/KumiteTimerMirror'
import { TournamentScreen } from '../../components/kumiteTimer/tournamentScreen/TournamentScreen'


const PAGE_PATH = 'kumite-timer'

export const KumiteTimerPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path={`/${PAGE_PATH}/set-up`} exact>
        <SetUpScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/set-up/*`}>
        <Redirect to={`/${PAGE_PATH}/set-up`} />
      </Route>
      <Route path={`/${PAGE_PATH}/mirror`} exact>
        <KumiteTimerMirror />
      </Route>
      <Route path={`/${PAGE_PATH}/mirror/*`}>
        <Redirect to={`/${PAGE_PATH}/mirror`} />
      </Route>
      <Route path={`/${PAGE_PATH}/tournament`} exact>
        <TournamentScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/tournament/*`}>
        <Redirect to={`/${PAGE_PATH}/tournament`} />
      </Route>
      <Route path={`/${PAGE_PATH}`} exact>
        <KumiteTimerScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/*`}>
        <Redirect to={`/${PAGE_PATH}`} />
      </Route>
    </Switch>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { SetUpScreen } from '../../components/groupStopwatch/setUpScreen/SetUpScreen'
import { GroupStopwatchScreen } from '../../components/groupStopwatch/groupStopwatchScreen/GroupStopwatchScreen'


const PAGE_PATH = 'group-stopwatch'

export const GroupStopWatchPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path={`/${PAGE_PATH}/set-up`} exact>
        <SetUpScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/set-up/*`}>
        <Redirect to={`/${PAGE_PATH}/set-up`} />
      </Route>
      <Route path={`/${PAGE_PATH}`} exact>
        <GroupStopwatchScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/*`}>
        <Redirect to={`/${PAGE_PATH}`} />
      </Route>
    </Switch>
  )
}

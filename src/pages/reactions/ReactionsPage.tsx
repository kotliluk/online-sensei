// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { ReactionsScreen } from '../../components/reactions/reactionsScreen/ReactionsScreen'
import { SetUpScreen } from '../../components/reactions/setUpScreen/SetUpScreen'


const PAGE_PATH = 'reactions'

export const ReactionsPage = (): JSX.Element => {
  return (
    <Switch>
      <Route path={`/${PAGE_PATH}/set-up`} exact>
        <SetUpScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/set-up/*`}>
        <Redirect to={`/${PAGE_PATH}/set-up`} />
      </Route>
      <Route path={`/${PAGE_PATH}`} exact>
        <ReactionsScreen />
      </Route>
      <Route path={`/${PAGE_PATH}/*`}>
        <Redirect to={`/${PAGE_PATH}`} />
      </Route>
    </Switch>
  )
}

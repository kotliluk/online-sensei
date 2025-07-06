import { configureStore, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit'
import { Dispatch, Store } from '@reduxjs/toolkit'
import { RootState } from './state'
import { Actions } from './actions'
import { reducer as groupStopwatchReducer } from './groupStopwatch/reducer'
import { reducer as intervalTimerReducer } from './intervalTimer/reducer'
import { reducer as kumiteTimerReducer } from './kumiteTimer/reducer'
import { reducer as pageReducer } from './page/reducer'
import { reducer as reactionsReducer } from './reactions/reducer'
import { initIntervalTimer } from './intervalTimer/actions'
import { initKumiteTimer } from './kumiteTimer/actions'
import { initPage } from './page/actions'
import { initReactions } from './reactions/actions'


export const store: Store<RootState, Actions> = configureStore({
  reducer: combineReducers({
    groupStopwatch: groupStopwatchReducer,
    intervalTimer: intervalTimerReducer,
    kumiteTimer: kumiteTimerReducer,
    page: pageReducer,
    reactions: reactionsReducer,
  }),
  // to ignore non-serializable Date field
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
})

store.dispatch(initIntervalTimer())
store.dispatch(initKumiteTimer())
store.dispatch(initReactions())
store.dispatch(initPage())

export type AppDispatch = Dispatch<Actions>

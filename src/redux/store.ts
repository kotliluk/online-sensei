import { configureStore, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit'
import { reducer as pageReducer } from './page/reducer'
import { reducer as reactionsReducer } from './reactions/reducer'
import { reducer as kumiteTimerReducer } from './kumiteTimer/reducer'
import { Dispatch, Store } from '@reduxjs/toolkit'
import { RootState } from './state'
import { Actions } from './actions'
import { initReactions } from './reactions/actions'
import { initPage } from './page/actions'


export const store: Store<RootState, Actions> = configureStore({
  reducer: combineReducers({
    kumiteTimer: kumiteTimerReducer,
    page: pageReducer,
    reactions: reactionsReducer,
  }),
  // to ignore non-serializable Date field
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
})

store.dispatch(initReactions())
store.dispatch(initPage())

export type AppDispatch = Dispatch<Actions>

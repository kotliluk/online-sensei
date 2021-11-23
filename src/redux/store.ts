import { configureStore, getDefaultMiddleware, combineReducers } from '@reduxjs/toolkit'
import { reducer as reactionsReducer } from './reactions/reducer'
import { Dispatch, Store } from '@reduxjs/toolkit'
import { RootState } from './state'
import { Actions } from './actions'


export const store: Store<RootState, Actions> = configureStore({
  reducer: combineReducers({
    reactions: reactionsReducer,
  }),
  // to ignore non-serializable Date field in Transportation object
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export type AppDispatch = Dispatch<Actions>

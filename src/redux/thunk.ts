import {
  ThunkDispatch as ReduxThunkDispatch,
  ThunkAction as ReduxThunkAction,
} from '@reduxjs/toolkit'
import { Actions } from './actions'
import { RootState } from './state'


export type AppThunkDispatch = ReduxThunkDispatch<RootState, unknown, Actions>
export type ThunkAction<T = void> = ReduxThunkAction<T, RootState, unknown, Actions>

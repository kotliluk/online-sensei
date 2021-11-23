import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux'
import { RootState } from './state'


export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

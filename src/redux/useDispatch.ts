import { useDispatch as useReduxDispatch } from 'react-redux'
import { AppDispatch } from './store'
import { AppThunkDispatch } from './thunk'


export const useDispatch = (): AppDispatch => useReduxDispatch<AppDispatch>()
export const useThunkDispatch = (): AppThunkDispatch => useReduxDispatch<AppThunkDispatch>()

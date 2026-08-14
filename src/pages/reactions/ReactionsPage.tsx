import { JSX } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ReactionsScreen } from '../../components/reactions/reactionsScreen/ReactionsScreen'
import { SetUpScreen } from '../../components/reactions/setUpScreen/SetUpScreen'


const PAGE_PATH = 'reactions'

export const ReactionsPage = (): JSX.Element => {
  return (
    <Routes>
      <Route path='set-up' element={<SetUpScreen />} />
      <Route path='set-up/*' element={<Navigate to={`/${PAGE_PATH}/set-up`} replace />} />
      <Route index element={<ReactionsScreen />} />
      <Route path='*' element={<Navigate to={`/${PAGE_PATH}`} replace />} />
    </Routes>
  )
}

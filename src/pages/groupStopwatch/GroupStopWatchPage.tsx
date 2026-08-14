import { JSX } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SetUpScreen } from '../../components/groupStopwatch/setUpScreen/SetUpScreen'
import { GroupStopwatchScreen } from '../../components/groupStopwatch/groupStopwatchScreen/GroupStopwatchScreen'


const PAGE_PATH = 'group-stopwatch'

export const GroupStopWatchPage = (): JSX.Element => {
  return (
    <Routes>
      <Route path='set-up' element={<SetUpScreen />} />
      <Route path='set-up/*' element={<Navigate to={`/${PAGE_PATH}/set-up`} replace />} />
      <Route index element={<GroupStopwatchScreen />} />
      <Route path='*' element={<Navigate to={`/${PAGE_PATH}`} replace />} />
    </Routes>
  )
}

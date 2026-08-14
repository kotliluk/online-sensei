import { JSX } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SetUpScreenSimple } from '../../components/intervalTimer/setUpScreenSimple/SetUpScreenSimple'
import { IntervalTimerScreen } from '../../components/intervalTimer/intervalTimerScreen/IntervalTimerScreen'
import { SetUpScreenAdvanced } from '../../components/intervalTimer/setUpScreenAdvanced/SetUpScreenAdvanced'


const PAGE_PATH = 'interval-timer'

export const IntervalTimerPage = (): JSX.Element => {
  return (
    <Routes>
      <Route path='set-up-advanced' element={<SetUpScreenAdvanced />} />
      <Route path='set-up-advanced/*' element={<Navigate to={`/${PAGE_PATH}/set-up-advanced`} replace />} />
      <Route path='set-up' element={<SetUpScreenSimple />} />
      <Route path='set-up/*' element={<Navigate to={`/${PAGE_PATH}/set-up`} replace />} />
      <Route index element={<IntervalTimerScreen />} />
      <Route path='*' element={<Navigate to={`/${PAGE_PATH}`} replace />} />
    </Routes>
  )
}

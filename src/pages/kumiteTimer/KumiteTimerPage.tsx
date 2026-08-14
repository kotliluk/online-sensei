import { JSX } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SetUpScreen } from '../../components/kumiteTimer/setUpScreen/SetUpScreen'
import { KumiteTimerScreen } from '../../components/kumiteTimer/kumiteTimerScreen/KumiteTimerScreen'
import { KumiteTimerMirror } from '../../components/kumiteTimer/kumiteTimerScreen/KumiteTimerMirror'
import { TournamentScreen } from '../../components/kumiteTimer/tournamentScreen/TournamentScreen'


const PAGE_PATH = 'kumite-timer'

export const KumiteTimerPage = (): JSX.Element => {
  return (
    <Routes>
      <Route path='set-up' element={<SetUpScreen />} />
      <Route path='set-up/*' element={<Navigate to={`/${PAGE_PATH}/set-up`} replace />} />
      <Route path='mirror' element={<KumiteTimerMirror />} />
      <Route path='mirror/*' element={<Navigate to={`/${PAGE_PATH}/mirror`} replace />} />
      <Route path='tournament' element={<TournamentScreen />} />
      <Route path='tournament/*' element={<Navigate to={`/${PAGE_PATH}/tournament`} replace />} />
      <Route index element={<KumiteTimerScreen />} />
      <Route path='*' element={<Navigate to={`/${PAGE_PATH}`} replace />} />
    </Routes>
  )
}

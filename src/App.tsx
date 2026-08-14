import { JSX, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { PageHeader } from './components/common/pageHeader/PageHeader'
import { MainPage } from './pages/main/MainPage'
import { ReactionsPage } from './pages/reactions/ReactionsPage'
import { KumiteTimerPage } from './pages/kumiteTimer/KumiteTimerPage'
import { useSelector } from './redux/useSelector'
import { selectTheme } from './redux/page/selector'
import { IntervalTimerPage } from './pages/intervalTimer/IntervalTimerPage'
import { GroupStopWatchPage } from './pages/groupStopwatch/GroupStopWatchPage'


// TODO - refactor with React advanced features
const App = (): JSX.Element => {
  const theme = useSelector(selectTheme)

  useEffect(() => {
    document.body.className = `theme--${theme}`
  })

  return (
    <div className='app with-scrollbar'>
      <PageHeader />
      <Routes>
        <Route path='/reactions/*' element={<ReactionsPage />} />
        <Route path='/kumite-timer/*' element={<KumiteTimerPage />} />
        <Route path='/interval-timer/*' element={<IntervalTimerPage />} />
        <Route path='/group-stopwatch/*' element={<GroupStopWatchPage />} />
        <Route path='/' element={<MainPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  )
}

export default App

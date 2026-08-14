import { createRoot } from 'react-dom/client'
import { store } from './redux/store'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.scss'
import { config } from './config'
import { ModalContainer } from './components/common/modal/modalContainer/ModalContainer'


const container = document.getElementById('root')

if (container === null) {
  throw new Error('Root container #root not found')
}

// NOTE: <React.StrictMode> is intentionally not used.
//
// Every feature screen owns its session through an unmount cleanup:
//
//   useEffect(() => () => { dispatch(setNotActualX()); clock.pause() }, [])
//
// and a sibling effect that redirects to the set-up screen whenever `isActual`
// turns false. Under React 17 (which this app was written for) StrictMode ran
// effects once. Since React 18 it runs them twice in development
// (mount -> cleanup -> mount), so the cleanup invalidates the session
// immediately after entering a screen and every feature bounces straight back
// to its set-up screen. Production builds never double-invoke, so they are
// unaffected either way.
//
// Re-enabling StrictMode requires moving the session reset off the unmount
// cleanup in all five feature screens first.
createRoot(container).render(
  <ReduxProvider store={store}>
    <BrowserRouter basename={config.basename}>
      <App />
      <ModalContainer />
    </BrowserRouter>
  </ReduxProvider>
)

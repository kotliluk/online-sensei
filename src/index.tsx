import React from 'react'
import ReactDOM from 'react-dom'
import { store } from './redux/store'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.scss'
import { config } from './config'
import { ModalContainer } from './components/common/modal/modalContainer/ModalContainer'


ReactDOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <BrowserRouter basename={config.basename}>
        <App />
        <ModalContainer />
      </BrowserRouter>
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

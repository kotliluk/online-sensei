// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useSelector } from 'react-redux'
import './ModalContainer.scss'
import { selectModalWindowType } from '../../../../redux/page/selector'
import { LoadAdvancedSeries } from '../../../intervalTimer/loadAdvancedSeriesModal/LoadAdvancedSeries'
import { useCloseModal } from '../../../../logic/hooks/useCloseModal'
import { SaveAdvancedSeries } from '../../../intervalTimer/saveAdvancedSeriesModal/SaveAdvancedSeries'
import { CancelTournamentModal } from '../../../kumiteTimer/tournamentScreen/CancelTournamentModal'
import { FightResultModal } from '../../../kumiteTimer/kumiteTimerScreen/FightResultModal'
import { ReopenTreeFightModal } from '../../../kumiteTimer/tournamentScreen/ReopenTreeFightModal'


export const ModalContainer = (): JSX.Element | null => {
  const [root] = useState<Element>(document.getElementById('modal-root') as Element)

  const modalType = useSelector(selectModalWindowType)
  const closeModal = useCloseModal()

  const close = useCallback((e: KeyboardEvent) => {
    e.code === 'Escape' && closeModal()
  }, [closeModal])

  useEffect(() => {
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [close])

  if (modalType === 'NONE') {
    return null
  }

  let modalWindow = null

  if (modalType === 'LOAD_ADVANCED_SERIES') {
    modalWindow = <LoadAdvancedSeries />
  } else if (modalType === 'SAVE_ADVANCED_SERIES') {
    modalWindow = <SaveAdvancedSeries />
  } else if (modalType === 'CANCEL_TOURNAMENT') {
    modalWindow = <CancelTournamentModal />
  } else if (modalType === 'FIGHT_RESULT') {
    modalWindow = <FightResultModal />
  } else if (modalType === 'REOPEN_TREE_FIGHT') {
    modalWindow = <ReopenTreeFightModal />
  }

  return ReactDOM.createPortal((
    <div className='modal-container'>
      {modalWindow}
    </div>
  ), root)
}

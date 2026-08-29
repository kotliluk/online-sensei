import { useEffect } from 'react'
import { useDispatch } from '../../redux/useDispatch'
import { setLeaveQuestion } from '../../redux/page/actions'
import { LeaveQuestion } from '../../types/leaveQuestion'


/**
 * Says what this screen would lose if it were left right now, or `null` when it would
 * lose nothing. `LeaveGuard` reads it to decide whether the browser's back deserves a
 * question, and which one.
 *
 * The screen has to say it rather than the guard work it out, because only the screen
 * knows: a fight nothing has happened in yet is not worth a question, and the same screen
 * a minute later is. It is cleared on the way out, so a screen that unmounts cannot leave
 * a question hanging over the one that follows it.
 */
export const useLeaveQuestion = (question: LeaveQuestion | null): void => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setLeaveQuestion(question))

    return () => {
      dispatch(setLeaveQuestion(null))
    }
  }, [question, dispatch])
}

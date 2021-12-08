import { State as IntervalTimerState } from './intervalTimer/state'
import { State as KumiteTimerState } from './kumiteTimer/state'
import { State as PageState } from './page/state'
import { State as ReactionsState } from './reactions/state'


export type RootState = {
  intervalTimer: IntervalTimerState,
  kumiteTimer: KumiteTimerState,
  page: PageState,
  reactions: ReactionsState,
}

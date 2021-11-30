import { State as KumiteTimerState } from './kumiteTimer/state'
import { State as PageState } from './page/state'
import { State as ReactionsState } from './reactions/state'


export type RootState = {
  kumiteTimer: KumiteTimerState,
  page: PageState,
  reactions: ReactionsState,
}

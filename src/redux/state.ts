import { State as PageState } from './page/state'
import { State as ReactionsState } from './reactions/state'


export type RootState = {
  page: PageState,
  reactions: ReactionsState,
}

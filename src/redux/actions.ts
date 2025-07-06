import { Actions as GroupStopwatchActions } from './groupStopwatch/actions'
import { Actions as IntervalTimerActions } from './intervalTimer/actions'
import { Actions as KumiteTimerActions } from './kumiteTimer/actions'
import { Actions as PageActions } from './page/actions'
import { Actions as ReactionsActions } from './reactions/actions'


export type Actions = GroupStopwatchActions | IntervalTimerActions | KumiteTimerActions | PageActions | ReactionsActions

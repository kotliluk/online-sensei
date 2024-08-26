import { Limits, Validator } from '../../logic/validation/types'
import { LSAccessWrapper, LSMapper } from '../../logic/localStorage/types'
import {
  getBooleanFromLS,
  getValidatedNumberFromLS,
  getValidatedStringFromLS, getValidatedTypeFromLS,
  saveToLS,
} from '../../logic/localStorage/access'
import { initialState, State } from './state'
import { anythingIsValid, isBetweenValidator, isValidArrayOf } from '../../logic/validation/validators'
import { emptyFunc } from '../../utils/function'
import { isValidCompetitor, isValidFight, isValidTournamentTree } from '../../types/tournament'


export const LIMITS: Limits<State> = {
  duration: { min: 30, max: 300 },
  competitorsCount: { min: 2, max: 128 },
  tournamentDuration: { min: 30, max: 300 },
}

export const VALIDATOR: Validator<State> = {
  isActual: anythingIsValid,
  duration: isBetweenValidator(LIMITS.duration),
  tournamentFight: anythingIsValid,
  activeTournament: anythingIsValid,
  tournamentName: anythingIsValid,
  tournamentType: (value) => value === 'TREE' || value === 'GROUP',
  tournamentDuration: isBetweenValidator(LIMITS.tournamentDuration),
  competitorsCount: isBetweenValidator(LIMITS.competitorsCount),
  competitors: isValidArrayOf(isValidCompetitor),
  tournamentTree: isValidTournamentTree,
  group: isValidArrayOf(isValidArrayOf(isValidFight)),
}

export const LS_KEYS: LSMapper<State> = {
  duration: 'KUMITE_TIMER__DURATION',
  activeTournament: 'KUMITE_TIMER__IS_TOURNAMENT',
  tournamentName: 'KUMITE_TIMER__TOURNAMENT_NAME',
  tournamentType: 'KUMITE_TIMER__TOURNAMENT_TYPE',
  tournamentDuration: 'KUMITE_TIMER__TOURNAMENT_DURATION',
  competitorsCount: 'KUMITE_TIMER__COMPETITORS_COUNT',
  competitors: 'KUMITE_TIMER__COMPETITORS',
  tournamentTree: 'KUMITE_TIMER__TOURNAMENT_TREE',
  group: 'KUMITE_TIMER__GROUP',
}

export const LS_ACCESS: LSAccessWrapper<State> = {
  isActual: {
    get: () => initialState.isActual,
    set: emptyFunc,
  },
  duration: {
    get: () => getValidatedNumberFromLS(LS_KEYS.duration, VALIDATOR.duration, initialState.duration),
    set: (value) => saveToLS(LS_KEYS.duration, value),
  },
  tournamentFight: {
    get: () => initialState.tournamentFight,
    set: emptyFunc,
  },
  activeTournament: {
    get: () => getBooleanFromLS(LS_KEYS.activeTournament, initialState.activeTournament),
    set: (value) => saveToLS(LS_KEYS.activeTournament, value),
  },
  tournamentName: {
    get: () => getValidatedStringFromLS(LS_KEYS.tournamentName, VALIDATOR.tournamentName, initialState.tournamentName),
    set: (value) => saveToLS(LS_KEYS.tournamentName, value),
  },
  tournamentType: {
    get: () => getValidatedStringFromLS(LS_KEYS.tournamentType, VALIDATOR.tournamentType, initialState.tournamentType),
    set: (value) => saveToLS(LS_KEYS.tournamentType, value),
  },
  tournamentDuration: {
    get: () => getValidatedNumberFromLS(
      LS_KEYS.tournamentDuration, VALIDATOR.tournamentDuration, initialState.tournamentDuration,
    ),
    set: (value) => saveToLS(LS_KEYS.tournamentDuration, value),
  },
  competitorsCount: {
    get: () => getValidatedNumberFromLS(
      LS_KEYS.competitorsCount, VALIDATOR.competitorsCount, initialState.competitorsCount,
    ),
    set: (value) => saveToLS(LS_KEYS.competitorsCount, value),
  },
  competitors: {
    get: () => getValidatedTypeFromLS(
      LS_KEYS.competitors, VALIDATOR.competitors, initialState.competitors,
    ),
    set: (value) => saveToLS(LS_KEYS.competitors, JSON.stringify(value)),
  },
  tournamentTree: {
    get: () => getValidatedTypeFromLS(
      LS_KEYS.tournamentTree, VALIDATOR.tournamentTree, initialState.tournamentTree,
    ),
    set: (value) => saveToLS(LS_KEYS.tournamentTree, JSON.stringify(value)),
  },
  group: {
    get: () => getValidatedTypeFromLS(LS_KEYS.group, VALIDATOR.group, initialState.group),
    set: (value) => saveToLS(LS_KEYS.group, JSON.stringify(value)),
  },
}

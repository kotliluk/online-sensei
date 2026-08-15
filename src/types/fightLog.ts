import { Senchu, switchSenchu } from './senchu'


export type FightSide = 'RED' | 'BLUE'

/**
 * What happened during a fight, as data rather than as a finished sentence.
 *
 * The events carry values instead of text for three reasons: the log is shown
 * in whichever language the app is set to, the grouping below has to know what
 * an event is to decide whether two of them are the same thing, and a
 * spreadsheet is far more useful with the values in their own columns than with
 * a sentence in one.
 *
 * `POINTS` carries a delta rather than the new total because that is how points
 * are read out loud - a grouped `+3` is an ippon, `+2` a waza-ari. Everything
 * else carries both ends, so an entry says what changed without the reader
 * having to track the running state.
 */
export type FightEvent
  = { kind: 'START' }
  | { kind: 'PAUSE' }
  | { kind: 'RESUME' }
  | { kind: 'RESET' }
  | { kind: 'END' }
  | { kind: 'REOPEN', redPoints: number, bluePoints: number }
  | { kind: 'POINTS', side: FightSide, delta: number }
  | { kind: 'FOULS', side: FightSide, from: number, to: number }
  | { kind: 'SENCHU', from: Senchu, to: Senchu }
  | { kind: 'TIME_SET', from: number, to: number }

export type FightEventKind = FightEvent['kind']

export type FightLogEntry = {
  /** Epoch milliseconds, so the reader's own clock can be used to show it. */
  at: number,
  /** Seconds left on the clock when it happened - what the scoreboard showed. */
  fightTime: number,
  event: FightEvent,
}

/**
 * Events after which the clock no longer runs down from where it was, and so
 * the stretch of log that may be grouped together ends.
 *
 * Without this a log kept across a reset would merge a point scored at 2:00 in
 * the first run with one scored at 2:00 in the second, and they are not the
 * same moment at all.
 */
const BREAKS_GROUPING: readonly FightEventKind[] = ['START', 'RESET', 'REOPEN', 'TIME_SET']

/**
 * An event that reports no change at all.
 *
 * These do not only come out of grouping a correction. They arrive first hand:
 * the score has a `0` button that sends an absolute zero, so pressing it at zero
 * asks to set what is already set, and resetting the clock before the fight
 * starts moves it to where it already stands. Both are a valid value, so the
 * setters accept them and the handlers see a change - the log is the last place
 * that can tell they were not one.
 */
const isNoOp = (event: FightEvent): boolean => {
  if (event.kind === 'POINTS') {
    return event.delta === 0
  }

  if (event.kind === 'FOULS' || event.kind === 'TIME_SET') {
    return event.from === event.to
  }

  return event.kind === 'SENCHU' && event.from === event.to
}

/** Whether the two events are about the same thing and so may be grouped. */
const isSameSubject = (a: FightEvent, b: FightEvent): boolean => {
  if (a.kind === 'POINTS' && b.kind === 'POINTS') {
    return a.side === b.side
  }

  if (a.kind === 'FOULS' && b.kind === 'FOULS') {
    return a.side === b.side
  }

  return a.kind === 'SENCHU' && b.kind === 'SENCHU'
}

/**
 * The two events joined into one, or null when they cancel each other out.
 *
 * Points add up, everything else keeps the value it ended on. A null means the
 * referee took back what they had just given, and an entry saying that nothing
 * changed is worse than no entry at all.
 */
const mergeEvents = (existing: FightEvent, incoming: FightEvent): FightEvent | null => {
  if (existing.kind === 'POINTS' && incoming.kind === 'POINTS') {
    const delta = existing.delta + incoming.delta

    return delta === 0 ? null : { ...existing, delta }
  }

  if (existing.kind === 'FOULS' && incoming.kind === 'FOULS') {
    return existing.from === incoming.to ? null : { ...existing, to: incoming.to }
  }

  if (existing.kind === 'SENCHU' && incoming.kind === 'SENCHU') {
    return existing.from === incoming.to ? null : { ...existing, to: incoming.to }
  }

  if (existing.kind === 'TIME_SET' && incoming.kind === 'TIME_SET') {
    return existing.from === incoming.to ? null : { ...existing, to: incoming.to }
  }

  return incoming
}

/**
 * Index of the entry the incoming event belongs to, or -1 for a new one.
 *
 * Only the tail of the log sharing the current clock reading is searched. Inside
 * one stretch the clock never goes back up, so entries made at the same reading
 * are always next to each other at the end - and stopping at the first entry
 * with a different reading is what keeps the search cheap.
 *
 * Adjacency is deliberately not required. A fighter cannot be awarded two
 * separate scoring techniques at the same instant, so `aka +1, ao +1, aka +1`
 * at one reading is a correction being made, not three exchanges, and the two
 * aka entries belong together even with the ao entry between them.
 */
const findEntryToGroupWith = (log: FightLogEntry[], fightTime: number, event: FightEvent): number => {
  for (let i = log.length - 1; i >= 0; --i) {
    const entry = log[i]

    if (entry.fightTime !== fightTime || BREAKS_GROUPING.includes(entry.event.kind)) {
      return -1
    }

    if (isSameSubject(entry.event, event)) {
      return i
    }
  }

  return -1
}

/**
 * Nudging the clock changes the reading with every press, so a run of `-`
 * presses cannot be found by the reading the way the other events are. It is
 * grouped by position instead: only straight into the press before it, which
 * turns five presses into one `2:00 -> 1:55`.
 */
const findTimeSetToGroupWith = (log: FightLogEntry[]): number => {
  const last = log.length - 1

  return (last >= 0 && log[last].event.kind === 'TIME_SET') ? last : -1
}

/**
 * The log with the entry added, grouped into an existing one where it belongs.
 *
 * Grouping rewrites the last matching entry rather than appending, so the log
 * is always in its final shape and can be rendered straight from state. The
 * entry keeps the moment it was opened at - only what it says about that moment
 * changes.
 */
export const appendFightEvent = (log: FightLogEntry[], entry: FightLogEntry): FightLogEntry[] => {
  if (isNoOp(entry.event)) {
    return log
  }

  const index = entry.event.kind === 'TIME_SET'
    ? findTimeSetToGroupWith(log)
    : findEntryToGroupWith(log, entry.fightTime, entry.event)

  if (index === -1) {
    return [...log, entry]
  }

  const event = mergeEvents(log[index].event, entry.event)

  if (event === null) {
    return [...log.slice(0, index), ...log.slice(index + 1)]
  }

  return log.map((existing, i) => i === index ? { ...existing, event } : existing)
}

/**
 * The log as seen from the other corner, for the mirrored cell of a group table
 * - the same fight is listed there with the fighters the other way round.
 */
export const switchFightLogSides = (log: FightLogEntry[]): FightLogEntry[] => {
  return log.map((entry) => {
    const event = entry.event

    if (event.kind === 'POINTS' || event.kind === 'FOULS') {
      return { ...entry, event: { ...event, side: event.side === 'RED' ? 'BLUE' : 'RED' } }
    }

    if (event.kind === 'SENCHU') {
      return { ...entry, event: { ...event, from: switchSenchu(event.from), to: switchSenchu(event.to) } }
    }

    if (event.kind === 'REOPEN') {
      return { ...entry, event: { ...event, redPoints: event.bluePoints, bluePoints: event.redPoints } }
    }

    return entry
  })
}

/**
 * Deliberately shallow, and deliberately accepting a missing log.
 *
 * A stored tournament that predates the log has fights without one, and
 * `getValidatedTypeFromLS` answers an invalid value by overwriting the key with
 * its default - so a stricter check here would silently wipe a tournament that
 * is halfway through.
 */
export const isValidFightLog = (x: any): x is FightLogEntry[] | undefined => {
  if (typeof x === 'undefined') {
    return true
  }

  if (!Array.isArray(x)) {
    return false
  }

  return x.every((entry) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (typeof entry === 'object') && (entry !== null) && (typeof entry.at === 'number')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      && (typeof entry.fightTime === 'number') && (typeof entry.event === 'object') && (entry.event !== null)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      && (typeof entry.event.kind === 'string')
  })
}

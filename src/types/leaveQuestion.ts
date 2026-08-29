/**
 * What a screen stands to lose, and so which question leaving it deserves.
 *
 * `FIGHT` is a kumite fight with something in its log - it can be saved, so the question
 * is about saving. `SESSION` is a run of Reactions, a series or a set of measured times:
 * nothing there is saved anywhere, so the question is only about losing it.
 *
 * A screen with nothing to lose right now publishes `null` and is not asked about.
 */
export type LeaveQuestion = 'FIGHT' | 'SESSION'

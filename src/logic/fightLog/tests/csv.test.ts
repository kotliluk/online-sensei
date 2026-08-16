import { buildFightCsv, ExportedFight, fightCsvFileName } from '../csv'
import { EN } from '../../translation/en'
import { CS } from '../../translation/cs'
import { FightEvent, FightLogEntry } from '../../../types/fightLog'


const AT = new Date(2026, 7, 15, 22, 10, 33).getTime()

const entry = (event: FightEvent, fightTime = 120, at = AT): FightLogEntry => ({ at, fightTime, event })

const fight = (over: Partial<ExportedFight> = {}): ExportedFight => ({
  tournamentName: 'Camp',
  redName: 'Aneta',
  blueName: 'Bob',
  redPoints: 3,
  redFouls: 1,
  bluePoints: 1,
  blueFouls: 0,
  senchu: 'RED',
  log: [],
  ...over,
})

/** Splits the built file back apart. Only safe while no cell needs quoting. */
const rowsOf = (csv: string): string[][] => csv.trimEnd().split('\r\n').map((row) => row.split(';'))


describe('buildFightCsv', () => {
  test('writes a header and then one row per log entry, in order', () => {
    // arrange
    const log = [
      entry({ kind: 'START' }),
      entry({ kind: 'POINTS', side: 'RED', delta: 3 }, 118),
      entry({ kind: 'END' }, 0),
    ]
    // act
    const rows = rowsOf(buildFightCsv(fight({ log }), EN))
    // assert
    expect(rows).toHaveLength(4)
    expect(rows[0]).toEqual([
      'Tournament', 'AKA', 'AO', 'Time', 'Remaining (s)', 'Type', 'Side', 'Value', 'Description',
      'Final AKA points', 'Final AKA fouls', 'Final AO points', 'Final AO fouls', 'Final senchu',
    ])
    expect(rows.slice(1).map((row) => row[5])).toEqual(['START', 'POINTS', 'END'])
  })

  test('repeats the fight on every row, so a row stands on its own', () => {
    // arrange
    const log = [entry({ kind: 'START' }), entry({ kind: 'PAUSE' })]
    // act
    const rows = rowsOf(buildFightCsv(fight({ log }), EN)).slice(1)
    // assert
    rows.forEach((row) => {
      expect([row[0], row[1], row[2]]).toEqual(['Camp', 'Aneta', 'Bob'])
      expect([row[9], row[10], row[11], row[12], row[13]]).toEqual(['3', '1', '1', '0', 'AKA'])
    })
  })

  test('writes the clock reading in seconds and the wall clock of the moment', () => {
    // act
    const rows = rowsOf(buildFightCsv(fight({ log: [entry({ kind: 'START' }, 82)] }), EN))
    // assert - `1:22` would be read as an hour and twenty two minutes by a spreadsheet
    expect(rows[1][3]).toBe('2026-08-15 22:10:33')
    expect(rows[1][4]).toBe('82')
  })

  test.each<{ name: string, event: FightEvent, side: string, value: string }>([
    { name: 'points as a signed number', event: { kind: 'POINTS', side: 'RED', delta: 3 }, side: 'AKA', value: '3' },
    { name: 'taken back points', event: { kind: 'POINTS', side: 'BLUE', delta: -1 }, side: 'AO', value: '-1' },
    {
      name: 'fouls as the value they ended on',
      event: { kind: 'FOULS', side: 'BLUE', from: 0, to: 2 },
      side: 'AO',
      value: '2',
    },
    {
      name: 'senchu as its new holder',
      event: { kind: 'SENCHU', from: 'NONE', to: 'BLUE' },
      side: '',
      value: 'AO',
    },
    {
      name: 'a cancelled senchu as nobody',
      event: { kind: 'SENCHU', from: 'RED', to: 'NONE' },
      side: '',
      value: '',
    },
    {
      name: 'a clock change in seconds',
      event: { kind: 'TIME_SET', from: 120, to: 82 },
      side: '',
      value: '82',
    },
    { name: 'nothing for the clock being started', event: { kind: 'START' }, side: '', value: '' },
    { name: 'nothing for a pause', event: { kind: 'PAUSE' }, side: '', value: '' },
  ])('writes $name', ({ event, side, value }) => {
    // act
    const row = rowsOf(buildFightCsv(fight({ log: [entry(event)] }), EN))[1]
    // assert
    expect([row[6], row[7]]).toEqual([side, value])
  })

  test('describes the event in the language of the app', () => {
    // act
    const row = rowsOf(buildFightCsv(fight({ log: [entry({ kind: 'POINTS', side: 'RED', delta: 3 })] }), EN))[1]
    // assert
    expect(row[8]).toBe('AKA +3')
  })

  test('still exports a fight whose log is empty', () => {
    // act
    const rows = rowsOf(buildFightCsv(fight(), EN))
    // assert - the state is worth having even when nothing was recorded
    expect(rows).toHaveLength(2)
    expect(rows[1].slice(3, 9)).toEqual(['', '', '', '', '', ''])
    expect(rows[1].slice(9)).toEqual(['3', '1', '1', '0', 'AKA'])
  })

  test('exports a fight played outside a tournament with the columns it has no answer for left empty', () => {
    // arrange
    const standalone = fight({ tournamentName: undefined, redName: undefined, blueName: undefined, senchu: 'NONE' })
    // act
    const rows = rowsOf(buildFightCsv(standalone, EN))
    // assert
    expect(rows[1].slice(0, 3)).toEqual(['', '', ''])
    expect(rows[1][13]).toBe('')
  })

  /**
   * Spelled out in full rather than asserted field by field. The tournament export
   * is built from the same header and the same rows, and the point of splitting
   * them apart was that a single fight comes out unchanged - this is what says so.
   */
  test('writes the file exactly like this', () => {
    // arrange
    const log = [entry({ kind: 'START' }), entry({ kind: 'POINTS', side: 'RED', delta: 3 }, 118)]
    // act & assert
    expect(buildFightCsv(fight({ log }), EN)).toBe(
      'Tournament;AKA;AO;Time;Remaining (s);Type;Side;Value;Description;'
      + 'Final AKA points;Final AKA fouls;Final AO points;Final AO fouls;Final senchu\r\n'
      + 'Camp;Aneta;Bob;2026-08-15 22:10:33;120;START;;;Fight started;3;1;1;0;AKA\r\n'
      + 'Camp;Aneta;Bob;2026-08-15 22:10:33;118;POINTS;AKA;3;AKA +3;3;1;1;0;AKA\r\n',
    )
  })

  test('quotes a name that would otherwise break the row apart', () => {
    // arrange
    const awkward = fight({ redName: 'Novák; Jan', blueName: 'Ann "Ace"' })
    // act
    const csv = buildFightCsv(awkward, EN)
    // assert
    expect(csv).toContain('"Novák; Jan";"Ann ""Ace"""')
  })
})

describe('buildFightCsv in another language', () => {
  const log = [
    entry({ kind: 'POINTS', side: 'RED', delta: 2 }),
    entry({ kind: 'TIME_SET', from: 120, to: 82 }),
  ]

  test('translates the headers', () => {
    // act
    const header = rowsOf(buildFightCsv(fight({ log }), CS))[0]
    // assert
    expect(header.slice(0, 6)).toEqual(['Turnaj', 'AKA', 'AO', 'Čas', 'Zbývá (s)', 'Typ'])
    expect(header.slice(9)).toEqual([
      'Výsledné AKA body', 'Výsledné AKA fauly', 'Výsledné AO body', 'Výsledné AO fauly', 'Výsledné senchu',
    ])
  })

  test('leaves the machine columns identical, so a file stays filterable across languages', () => {
    // act
    const columnsOf = (rows: string[][]): string[][] => rows.slice(1).map((row) => [row[5], row[6], row[7]])
    const czech = columnsOf(rowsOf(buildFightCsv(fight({ log }), CS)))
    const english = columnsOf(rowsOf(buildFightCsv(fight({ log }), EN)))
    // assert - the kind and the corner are identifiers, only the description is prose
    expect(czech).toEqual([['POINTS', 'AKA', '2'], ['TIME_SET', '', '82']])
    expect(czech).toEqual(english)
  })

  test('writes the description in the language it was given', () => {
    // act
    const czech = rowsOf(buildFightCsv(fight({ log }), CS))[2][8]
    const english = rowsOf(buildFightCsv(fight({ log }), EN))[2][8]
    // assert
    expect(czech).toBe('Čas 2:00 → 1:22')
    expect(english).toBe('Time 2:00 → 1:22')
  })
})

describe('fightCsvFileName', () => {
  test('names the file by the local date and time', () => {
    // act & assert
    expect(fightCsvFileName(new Date(2026, 7, 15, 9, 5))).toBe('kumite-2026-08-15-0905.csv')
  })
})

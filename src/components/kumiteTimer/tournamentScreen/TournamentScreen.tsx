import { JSX, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TournamentScreen.scss'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { Translation } from '../../../logic/translation/translation'
import {
  selectKumiteTimerRepechageTree,
  selectKumiteTimerTournamentGroup,
  selectKumiteTimerTournamentName,
  selectKumiteTimerTournamentTree,
  selectKumiteTimerTournamentType,
} from '../../../redux/kumiteTimer/selector'
import { TreeTournamentScreen } from './TreeTournamentScreen'
import { GroupTournamentScreen } from './GroupTournamentScreen'
import { Button } from '../../atoms/button/Button'
import { useDispatch } from '../../../redux/useDispatch'
import { setModalWindow } from '../../../redux/page/actions'
import { TournamentSource } from '../../../logic/tournament/collect'
import {
  buildTournamentLogCsv, buildTournamentOverviewCsv, groupOverviewRows, tournamentCsvFileName,
} from '../../../logic/tournament/csv'
import { exportFile, willShareFile } from '../../../logic/download/exportFile'
import { CSV_MIME_TYPE } from '../../../utils/csv'
import { PictureBlock, svgsToPngBlob } from '../../../logic/download/svgPicture'
import { groupPictureBlob } from '../../../logic/tournament/groupPicture'
import { PICTURE_BACKGROUND, PNG_MIME_TYPE, tournamentPictureFileName } from '../../../logic/download/picture'


/**
 * The parts of a bracket to put in the picture, labelled the way the screen
 * labels them - the repechage carries an `<h2>` there, so it carries a heading
 * here. The main tree has none on screen and gets none in the picture.
 */
const treePictureBlocks = (translation: Translation): PictureBlock[] => {
  const tree = document.querySelector<SVGSVGElement>('.tree-wrapper svg')
  const repechage = document.querySelector<SVGSVGElement>('.repechage-wrapper svg')

  return [
    ...(tree === null ? [] : [{ svg: tree }]),
    ...(repechage === null
      ? []
      : [{ svg: repechage, heading: translation.kumiteTimer.setUpScreen.tournament.repechage }]),
  ]
}

export const TournamentScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)
  const { kumiteTimer: { tournamentScreen: { export: t } } } = translation

  const tournamentName = useSelector(selectKumiteTimerTournamentName)
  const tournamentType = useSelector(selectKumiteTimerTournamentType)
  const group = useSelector(selectKumiteTimerTournamentGroup)
  const tree = useSelector(selectKumiteTimerTournamentTree)
  const repechage = useSelector(selectKumiteTimerRepechageTree)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // the buttons say what they do, and that depends on the device, not on the tournament
  const [shares] = useState(() => willShareFile(CSV_MIME_TYPE))

  const handleCancel = useCallback(() => {
    dispatch(setModalWindow('CANCEL_TOURNAMENT'))
  }, [dispatch])

  const handleBack = useCallback(() => {
    void navigate('/kumite-timer/set-up')
  }, [dispatch])

  /**
   * Two files rather than one download of both. A single click that produces two
   * files means a "allow multiple downloads?" prompt on a desktop and two
   * attachments in one share sheet on a phone, and neither is worth the click it
   * saves.
   */
  const exportCsv = useCallback((part: 'log' | 'overview') => {
    const source: TournamentSource = { name: tournamentName, type: tournamentType, group, tree, repechage }
    const content = part === 'log'
      ? buildTournamentLogCsv(source, translation)
      : buildTournamentOverviewCsv(source, translation)

    exportFile(new File(
      [content],
      tournamentCsvFileName(part, tournamentName, new Date()),
      { type: CSV_MIME_TYPE },
    ))
  }, [tournamentName, tournamentType, group, tree, repechage, translation])

  const handleExportLog = useCallback(() => exportCsv('log'), [exportCsv])
  const handleExportOverview = useCallback(() => exportCsv('overview'), [exportCsv])

  /**
   * The picture is made from what is drawn, not from the state, so this reaches
   * for the rendered bracket rather than taking it as a prop. A query in a click
   * handler is cheaper than a ref threaded through a screen that has no other
   * reason to expose one - and there is nothing to keep in sync, since the answer
   * is only wanted at the moment the button is pressed.
   */
  const handleExportPicture = useCallback(() => {
    const source: TournamentSource = { name: tournamentName, type: tournamentType, group, tree, repechage }

    const blob = tournamentType === 'TREE'
      ? svgsToPngBlob(treePictureBlocks(translation), PICTURE_BACKGROUND)
      : groupPictureBlob(groupOverviewRows(source, translation), PICTURE_BACKGROUND)

    void blob.then((content) => {
      if (content === null) {
        return
      }

      exportFile(new File(
        [content],
        tournamentPictureFileName(tournamentName, new Date()),
        { type: PNG_MIME_TYPE },
      ))
    })
  }, [tournamentName, tournamentType, group, tree, repechage, translation])

  return (
    <main className='tournament-screen'>
      <h1>{translation.kumiteTimer.setUpScreen.tournament.label}: {tournamentName}</h1>

      {tournamentType === 'TREE' ? <TreeTournamentScreen /> : <GroupTournamentScreen />}

      <div className='tournament-export'>
        <Button className='export-btn' onClick={handleExportLog}>
          {shares ? t.shareLog : t.downloadLog}
        </Button>

        <Button className='export-btn' onClick={handleExportOverview}>
          {shares ? t.shareOverview : t.downloadOverview}
        </Button>

        <Button className='export-btn' onClick={handleExportPicture}>
          {shares ? t.sharePicture : t.downloadPicture}
        </Button>
      </div>

      <div className='buttons'>
        <Button
          className='cancel-btn'
          onClick={handleCancel}
        >
          {translation.common.cancel}
        </Button>

        <Button
          className='back-btn'
          onClick={handleBack}
        >
          {translation.common.back}
        </Button>
      </div>
    </main>
  )
}

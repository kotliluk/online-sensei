import { JSX } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'
import { OSIcon } from '../../icons/OSIcon'
import { SettingsMenu } from '../settingsMenu/SettingsMenu'
import { useSelector } from '../../../redux/useSelector'
import { selectLeaveQuestion } from '../../../redux/page/selector'


export const PageHeader = (): JSX.Element => {
  const leaveQuestion = useSelector(selectLeaveQuestion)

  const sign = (
    <>
      <OSIcon className='logo' />
      OnlineSensei
    </>
  )

  /**
   * The bar runs the full width just above the score, so on a phone it is the easiest
   * thing to hit by accident - and it used to leave without a word. It stops being a link
   * whenever the screen showing has something to lose, which is the same answer the leave
   * guard works from, so the two can never disagree.
   *
   * A span rather than an anchor without an href: an anchor is still a link to a screen
   * reader and still answers a click. Nothing else changes - global styles give `a`
   * `color: inherit` and no underline, so the sign looks the same and loses the cursor.
   */
  return (
    <header className='page-header'>
      {leaveQuestion === null
        ? <Link to='/' className='home-link'>{sign}</Link>
        : <span className='home-link'>{sign}</span>}

      <SettingsMenu />
    </header>
  )
}

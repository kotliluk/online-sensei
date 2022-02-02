// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './SettingsMenu.scss'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { useSelector } from '../../../redux/useSelector'
import { selectTheme, selectTranslation } from '../../../redux/page/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { setTheme, setTranslation } from '../../../redux/page/actions'
import { Select } from '../../atoms/select/Select'
import { getAllTranslations, Language } from '../../../logic/translation'
import { Button } from '../../atoms/button/Button'
import { MenuOpened } from '../../icons/MenuOpened'
import { MenuClosed } from '../../icons/MenuClosed'


export const SettingsMenu = (): JSX.Element => {
  const translation = useSelector(selectTranslation)
  const theme = useSelector(selectTheme)
  const [allLanguages] = useState(getAllTranslations)

  const [opened, setOpened] = useState(false)

  const dispatch = useDispatch()

  const handleLanguageChange = useCallback((lang: string) => {
    dispatch(setTranslation(lang as Language))
  }, [dispatch])

  const handleThemeChange = useCallback((isDark: boolean) => {
    dispatch(setTheme(isDark ? 'dark' : 'light'))
  }, [dispatch])

  // TODO - closing on click outside
  // TODO - styled toggle input
  return (
    <>
      <Button className='menu-toggle-btn' onClick={() => setOpened(o => !o)}>
        {opened ? <MenuOpened /> : <MenuClosed />}
      </Button>
      <section className={`settings-menu ${opened ? 'opened' : ''}`}>
        <ul className='settings-list'>
          <li className='lang-settings'>
            <label>{translation.common.language}:</label>
            <Select
              selected={translation.languageShort}
              values={allLanguages.map(transl => ({ value: transl.languageShort, text: transl.language }))}
              onChange={handleLanguageChange}
            />
          </li>

          <li className='theme-settings'>
            <label>{translation.common.darkTheme}:</label>
            <CheckBox checked={theme === 'dark'} onChange={handleThemeChange} />
          </li>
        </ul>

        <div className='info'>
          <span className='author'>
            Lukáš Kotlík, © {new Date().getFullYear()}
          </span>
          <a
            className='github-link'
            href='https://github.com/kotliluk/online-sensei'
            target='_blank'
          >
            About
          </a>
        </div>
      </section>
    </>
  )
}

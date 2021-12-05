// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'
import { CheckBox } from '../../atoms/checkBox/CheckBox'
import { useSelector } from '../../../redux/useSelector'
import { selectTheme, selectTranslation } from '../../../redux/page/selector'
import { useDispatch } from '../../../redux/useDispatch'
import { setTheme, setTranslation } from '../../../redux/page/actions'
import { Select } from '../../atoms/select/Select'
import { getAllTranslations, Language } from '../../../logic/translation'
import { config } from '../../../config'
import { OSIcon } from '../../icons/OSIcon'


export const PageHeader = (): JSX.Element => {
  const translation = useSelector(selectTranslation)
  const theme = useSelector(selectTheme)
  const [allLanguages] = useState(getAllTranslations)

  const dispatch = useDispatch()

  const handleLanguageChange = useCallback((lang: string) => {
    dispatch(setTranslation(lang as Language))
  }, [dispatch])

  const handleThemeChange = useCallback((isDark: boolean) => {
    dispatch(setTheme(isDark ? 'dark' : 'light'))
  }, [dispatch])

  return (
    <header className='page-header'>
      <Link to={config.basename} className='home-link'>
        <OSIcon className='logo' />
        OnlineSensei
      </Link>

      <div className='lang-settings'>
        <label>{translation.common.language}:</label>
        <Select
          selected={translation.languageShort}
          values={allLanguages.map(transl => ({ value: transl.languageShort, text: transl.language }))}
          onChange={handleLanguageChange}
        />
      </div>

      <div className='theme-settings'>
        <label>{translation.common.darkTheme}:</label>
        <CheckBox checked={theme === 'dark'} onChange={handleThemeChange} />
      </div>
    </header>
  )
}

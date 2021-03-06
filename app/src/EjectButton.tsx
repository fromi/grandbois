import {css} from '@emotion/core'
import {faUserSlash} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import TowerColor from '@gamepark/grandbois/material/TowerColor'
import {GameSpeed, useNow, useOptions, usePlayers, useSound} from '@gamepark/react-client'
import React, {FC} from 'react'
import {useTranslation} from 'react-i18next'
import Images from './material/Images'
import toggleSound from './sounds/toggle.mp3'
import IconButton from './util/IconButton'

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  openEjectPopup: () => void
  subMenu?: boolean
  disabled?: boolean
}

const EjectButton: FC<Props> = ({subMenu, openEjectPopup, ...props}) => {
  const {t} = useTranslation()
  const players = usePlayers<TowerColor>()
  const [toggle] = useSound(toggleSound)
  const now = useNow()
  const options = useOptions()
  const playerTimeout = options?.speed === GameSpeed.RealTime && players.some(player => player.time?.playing && player.time.availableTime < now - Date.parse(player.time.lastChange))
  if (!playerTimeout) {
    return null
  }
  return (
    <>
      <IconButton css={ejectButtonStyle} title={t('Eject a player')} aria-label={t('Eject a player')}
                  onClick={() => toggle.play() && openEjectPopup()} {...props}>
        {subMenu && <span css={subMenuTitle}>{t('Eject a player')}</span>}
        <FontAwesomeIcon icon={faUserSlash}/>
      </IconButton>
    </>
  )
}

const ejectButtonStyle = css`
  background-image: url(${Images.buttonRed});
  padding-left: 0.35em !important;
  padding-right: 0.35em !important;
`

const subMenuTitle = css`
  font-size: 0.9em;
  font-weight: lighter;
  text-shadow: 0 0 0.2em #000, 0 0 0.2em #000, 0 0 0.2em #000, 0 0 0.2em #000;
  text-transform: uppercase;
  margin-right: 1em;
`

export default EjectButton
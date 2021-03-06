import {css, keyframes} from '@emotion/core'
import {
  faChess, faChevronDown, faChevronUp, faClock, faCompress, faExpand, faFastBackward, faHome, faMoon, faSignOutAlt, faSun, faVolumeMute, faVolumeUp
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import GameView from '@gamepark/grandbois/GameView'
import TowerColor from '@gamepark/grandbois/material/TowerColor'
import {useGame, usePlayerId, usePlayers, useRematch, useSound} from '@gamepark/react-client'
import {useTheme} from 'emotion-theming'
import fscreen from 'fscreen'
import NoSleep from 'nosleep.js'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import EjectButton from './EjectButton'
import EjectPopup from './EjectPopup'
import Images from './material/Images'
import QuitPopup from './QuitPopup'
import RematchPopup from './RematchPopup'
// @ts-ignore
import toggleSound from './sounds/toggle.mp3'
import Theme, {LightTheme} from './Theme'
import TimePopup from './TimePopup'
import {resetTutorial} from './tutorial/Tutorial'
import IconButton from './util/IconButton'
import {platformUri} from './util/Styles'

const noSleep = new NoSleep()

const MainMenu = () => {
  const game = useGame<GameView>()
  const playerId = usePlayerId<TowerColor>()
  const {t} = useTranslation()
  const theme = useTheme<Theme>()
  const players = usePlayers<TowerColor>()
  const player = players.find(player => player.id === playerId)
  const quit = game?.players.find(player => player.tower === playerId)?.eliminated
  const isPlaying = players.find(player => player.id === playerId)?.time?.playing
  const [fullScreen, setFullScreen] = useState(!fscreen.fullscreenEnabled)
  const [ejectPopupOpen, setEjectPopupOpen] = useState(false)
  const [displayMenu, setDisplayMenu] = useState(false)
  const gameOverRef = useRef<boolean | undefined>()
  const [displayRematchTooltip, setDisplayRematchTooltip] = useState(false)
  const [timePopupOpen, setTimePopupOpen] = useState(false)
  const {rematch, rematchOffer, ignoreRematch} = useRematch<TowerColor>()
  const [toggle, {mute, unmute, muted}] = useSound(toggleSound)
  const [quitPopupOpen, setQuitPopupOpen] = useState(false)

  function toggleSounds() {
    if (muted) {
      unmute()
      toggle.play()
    } else {
      toggle.play()
      mute()
    }
  }

  useEffect(() => {
    if (game) {
      if (game.over) {
        if (gameOverRef.current === false) {
          setDisplayRematchTooltip(true)
          gameOverRef.current = true
        }
      } else {
        gameOverRef.current = false
      }
    }
  }, [game, gameOverRef])

  const onFullScreenChange = () => {
    setFullScreen(fscreen.fullscreenElement != null)
    if (fscreen.fullscreenElement) {
      window.screen.orientation.lock('landscape')
        .then(() => noSleep.enable())
        .catch(() => console.info('screen orientation cannot be locked on this device'))
    } else {
      noSleep.disable()
    }
  }
  useEffect(() => {
    fscreen.addEventListener('fullscreenchange', onFullScreenChange)
    return () => {
      fscreen.removeEventListener('fullscreenchange', onFullScreenChange)
    }
  }, [])
  return (
    <>
      <div css={[menuStyle, displayMenu && hidden]}>
        {game && !!playerId && !isPlaying && !game.over && <EjectButton openEjectPopup={() => setEjectPopupOpen(true)} css={menuButtonStyle}/>}
        {game && !!playerId && game.over && !game.tutorial &&
            <IconButton css={[menuButtonStyle, redButtonStyle]} title={t('Offer a rematch')} onClick={() => rematch()}>
              <FontAwesomeIcon icon={faChess}/>
              {displayRematchTooltip && <span css={tooltipStyle}>{t('Offer a friendly rematch')}</span>}
            </IconButton>
        }
        {fscreen.fullscreenEnabled && (fullScreen ?
            <IconButton css={[menuButtonStyle, fullScreenButtonStyle]} title={t('Leave full screen')} aria-label={t('Leave full screen')}
                        onClick={() => toggle.play() && fscreen.exitFullscreen()}>
              <FontAwesomeIcon icon={faCompress}/>
            </IconButton>
            :
            <IconButton css={[menuButtonStyle, fullScreenButtonStyle]} title={t('Go to full screen')} aria-label={t('Go to full screen')}
                        onClick={() => toggle.play() && fscreen.requestFullscreen(document.getElementById('root')!)}>
              <FontAwesomeIcon icon={faExpand}/>
            </IconButton>
        )}
        <IconButton css={[menuButtonStyle, mainMenuButtonStyle]} title={t('Menu')} aria-label={t('Menu')}
                    onClick={() => toggle.play() && setDisplayMenu(true)}>
          <FontAwesomeIcon icon={faChevronDown}/>
        </IconButton>
      </div>
      <div css={[menuStyle, openMenuStyle, !displayMenu && hidden]}>
        <IconButton css={[menuButtonStyle, mainMenuButtonStyle]} onClick={() => toggle.play() && setDisplayMenu(false)}>
          <span css={subMenuTitle}>{t('Close')}</span>
          <FontAwesomeIcon icon={faChevronUp}/>
        </IconButton>
        {game && !!playerId && game.over && !game.tutorial &&
        <IconButton css={[menuButtonStyle, redButtonStyle]} title={t('Offer a rematch')}>
            <span css={subMenuTitle}>{t('Offer a rematch')}</span>
            <FontAwesomeIcon icon={faChess}/>
        </IconButton>
        }
        {fscreen.fullscreenEnabled && (fullScreen ?
            <IconButton css={[menuButtonStyle, fullScreenButtonStyle]}
                        onClick={() => toggle.play() && fscreen.exitFullscreen()}>
              <span css={subMenuTitle}>{t('Leave full screen')}</span>
              <FontAwesomeIcon icon={faCompress}/>
            </IconButton> :
            <IconButton css={[menuButtonStyle, fullScreenButtonStyle]}
                        onClick={() => toggle.play() && fscreen.requestFullscreen(document.getElementById('root')!)}>
              <span css={subMenuTitle}>{t('Go to full screen')}</span>
              <FontAwesomeIcon icon={faExpand}/>
            </IconButton>
        )}
        <IconButton css={[menuButtonStyle, homeButtonStyle]} onClick={() => toggle.play().then(() => window.location.href = platformUri)}>
          <span css={subMenuTitle}>{t('Back to home page')}</span>
          <FontAwesomeIcon icon={faHome}/>
        </IconButton>
        <IconButton css={[menuButtonStyle, themeButtonStyle]} onClick={toggleSounds}>
          <span css={subMenuTitle}>{muted ? t('Enable sound') : t('Mute sound')}</span>
          <FontAwesomeIcon icon={muted ? faVolumeMute : faVolumeUp}/>
        </IconButton>
        <IconButton css={[menuButtonStyle, themeButtonStyle]} onClick={() => toggle.play() && theme.switchThemeColor()}>
          {theme.color === LightTheme ?
            <>
              <span css={subMenuTitle}>{t('Enable dark mode')}</span>
              <FontAwesomeIcon icon={faMoon}/>
            </>
            :
            <>
              <span css={subMenuTitle}>{t('Enable light mode')}</span>
              <FontAwesomeIcon icon={faSun}/>
            </>
          }
        </IconButton>
        {game && !game.tutorial &&
        <IconButton css={[menuButtonStyle, clockButtonStyle]} onClick={() => toggle.play() && setTimePopupOpen(true)}>
          <span css={subMenuTitle}>{t('Thinking time')}</span>
          <FontAwesomeIcon icon={faClock}/>
        </IconButton>
        }
        {game && player && !quit && !game.over &&
        <IconButton css={[menuButtonStyle, redButtonStyle]} onClick={() => setQuitPopupOpen(true)}>
            <span css={subMenuTitle}>{t('Leave the game')}</span>
            <FontAwesomeIcon icon={faSignOutAlt}/>
        </IconButton>
        }
        {game && !!playerId && !isPlaying && !game.over &&
        <EjectButton openEjectPopup={() => setEjectPopupOpen(true)} subMenu={true} css={menuButtonStyle}/>
        }
        {game && game.tutorial &&
        <IconButton css={[menuButtonStyle, tutorialButtonStyle]} onClick={() => resetTutorial()}>
          <span css={subMenuTitle}>{t('Restart the tutorial')}</span>
          <FontAwesomeIcon icon={faFastBackward}/>
        </IconButton>
        }
      </div>
      <RematchPopup rematchOffer={rematchOffer} onClose={ignoreRematch}/>
      {timePopupOpen && <TimePopup onClose={() => setTimePopupOpen(false)}/>}
      {ejectPopupOpen && <EjectPopup playerId={playerId!} players={players} onClose={() => setEjectPopupOpen(false)}/>}
      {quitPopupOpen && <QuitPopup onClose={() => setQuitPopupOpen(false)}/>}
    </>
  )
}

const menuStyle = css`
  position: absolute;
  top: 0;
  right: 0;
  transition: opacity 0.5s ease-in-out;
  background-image: url(${Images.woodTexture});
  background-position: center center;
  padding: 0.1em;
  border-radius: 0 0 0 1em;
  border: solid 0.1em saddlebrown;
  border-top: solid 0 saddlebrown;
  box-shadow: 0 0 1em #000;
`

const openMenuStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #EEE;
  text-align: right;
  font-weight: lighter;
  text-shadow: 0 0 0.3em #000, 0 0 0.3em #000;
  text-transform: uppercase;
`

const hidden = css`
  opacity: 0;
  pointer-events: none;
`

const subMenuTitle = css`
  font-size: 0.9em;
  font-weight: lighter;
  text-shadow: 0 0 0.2em #000, 0 0 0.2em #000, 0 0 0.2em #000, 0 0 0.2em #000;
  text-transform: uppercase;
  margin-right: 1em;
`

const menuButtonStyle = css`
  width: fit-content;
  min-width: 2em;
  font-size: 4em;
  color: #EEE;
  margin: 0.1em;
  padding: 0.5em 0.55em;
  background-size: contain;
  background-position: right;
  background-repeat: no-repeat;
  background-color: transparent;
  border-radius: 0;
  opacity: 0.8;
  white-space: nowrap;
  justify-content: right;
  &:hover, &:active, &:focus, &:visited, &:before {
    opacity: 1;
    background-color: transparent;
  }
  &:active {
    transform: translateY(1px);
  }
`
const homeButtonStyle = css`
  padding-right: 0.5em;
  background-image: url(${Images.buttonGreen});
`

const themeButtonStyle = css`
  padding-right: 0.5em;
  background-image: url(${Images.buttonBlue});
`

const clockButtonStyle = css`
  background-image: url(${Images.buttonGrey});
`

const mainMenuButtonStyle = css`
  background-image: url(${Images.buttonYellow});
`
const fullScreenButtonStyle = css`
  background-image: url(${Images.buttonBlack});
`
const redButtonStyle = css`
  background-image: url(${Images.buttonRed});
`

const tutorialButtonStyle = css`
  background-image: url(${Images.buttonRed});
  padding-left: 0.35em;
  padding-right: 0.5em;
`

const displayForAMoment = keyframes`
  from, to, 50% {opacity: 0}
  60%, 90% {opacity: 1}
`

const tooltipStyle = css`
  position: absolute;
  padding: 0.25em;
  bottom: -2em;
  border-radius: 0.25em;
  left: 50%;
  transform: translateX(-50%);
  margin: auto;
  background: black;
  animation: ${displayForAMoment} 20s forwards;
  pointer-events: none;
  &:before {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    border-left: 0.5em solid transparent;
    border-right: 0.5em solid transparent;
    top: -0.5em;
    left: 50%;
    margin-left: -0.5em;
    border-bottom: 0.5em solid black;
  }
`

export default MainMenu
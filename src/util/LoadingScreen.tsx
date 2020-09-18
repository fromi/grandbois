import {css} from '@emotion/core'
import {faLightbulb, faPaintBrush, faWrench} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useTheme} from 'emotion-theming'
import React, {FunctionComponent} from 'react'
import {useTranslation} from 'react-i18next'
import Images from '../material/Images'
import GrandboisBox from '../material/grandbois3D.png'
import Theme from '../Theme'
import {backgroundColor, textColor} from './Styles'

const LoadingScreen: FunctionComponent<{ display: boolean }> = ({display}) => {
  const {t} = useTranslation()
  const theme = useTheme<Theme>()
  return (
    <div css={[loadingScreenStyle, textColor(theme), backgroundColor(theme), !display && css`opacity: 0`]}>
      <img css={gameBox} src={GrandboisBox} alt={t('Grandbois')}/>
      <h2 css={gameTitle}>{t('Grandbois')}</h2>
      <p css={gamePeople}>
        <FontAwesomeIcon css={iconStyle} icon={faLightbulb}/>{t('Auteur : Frédéric Guérard')}
        <br/>
        <FontAwesomeIcon css={iconStyle} icon={faPaintBrush}/>{t('Artiste : Camille Chaussy')}
        <br/>
        <FontAwesomeIcon css={iconStyle} icon={faWrench}/>{t('Éditeurs : The Flying Games, Origames')}</p>
    </div>
  )
}

const loadingScreenStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 2s;
  background-image: url(${Images.coverArtwork169});
  background-size: cover;
  background-position: center;
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  > * {
    z-index: 1;
  }
`

const gameBox = css`
  position: relative;
  width: 46.64em;
  height: 66em;
  margin-top: 8em;
  margin-bottom: 3em;
`

const gameTitle = css`
  font-size: 5em;
  margin: 0;
`
const gamePeople = css`
  font-size: 3em;
`
const iconStyle = css`
  min-width: 6em;
  position: relative;
`
export default LoadingScreen
import {css, keyframes} from '@emotion/core'
import {faHourglassEnd, faTimes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import TowerColor from '@gamepark/grandbois/material/TowerColor'
import {getPlayerName} from '@gamepark/grandbois/Rules'
import {usePlayerId, usePlayers} from '@gamepark/react-client'
import RematchOffer from '@gamepark/react-client/dist/Types/RematchOffer'
import {useTheme} from 'emotion-theming'
import React, {FunctionComponent} from 'react'
import {useTranslation} from 'react-i18next'
import Theme, {LightTheme} from './Theme'
import Button from './util/Button'
import {closePopupStyle, popupDarkStyle, popupFixedBackgroundStyle, popupLightStyle, popupPosition, popupStyle} from './util/Styles'

type Props = {
  rematchOffer?: RematchOffer<TowerColor>
  onClose: () => void
}

const RematchPopup: FunctionComponent<Props> = ({rematchOffer, onClose}) => {
  const {t} = useTranslation()
  const theme = useTheme<Theme>()
  const playerId = usePlayerId<TowerColor>()
  const players = usePlayers<TowerColor>()
  const getName = (empire: TowerColor) => players.find(p => p.id === empire)?.name || getPlayerName(empire, t)
  return (
    <div css={[popupFixedBackgroundStyle, !rematchOffer && css`display: none`]} onClick={onClose}>
      <div css={[popupStyle, popupPosition, css`width: 60%`, theme.color === LightTheme ? popupLightStyle : popupDarkStyle]}
           onClick={event => event.stopPropagation()}>
        <div css={closePopupStyle} onClick={onClose}><FontAwesomeIcon icon={faTimes}/></div>
        {rematchOffer && (
          playerId === rematchOffer.playerId ? (
            rematchOffer.link ?
              <>
                <h2>{t('You offered a friendly rematch')}</h2>
                <p>{t('You offer was sent to the other players')}</p>
                <Button onClick={() => window.location.href = rematchOffer.link!}>{t('See the new game')}</Button>
              </>
              :
              <>
                <h2>{t('Rematch offer')}</h2>
                <p>{t('Please stand by…')}</p>
                <FontAwesomeIcon css={spinnerStyle} icon={faHourglassEnd}/>
              </>
          ) : (
            rematchOffer.link &&
            <>
                <h2>{t('{player} offers a friendly rematch!', {player: getName(rematchOffer.playerId)})}</h2>
                <p>{t('Click the following link to go to the new game:')}</p>
                <Button onClick={() => window.location.href = rematchOffer.link!}>{t('See the new game')}</Button>
            </>
          )
        )}
      </div>
    </div>
  )
}

const rotate = keyframes`
  from {transform: none}
  to {transform: rotate(180deg)}
`

const spinnerStyle = css`
  font-size: 2em;
  animation: ${rotate} 1s ease-in-out infinite;
  margin-bottom: 0.5em;
`

export default RematchPopup
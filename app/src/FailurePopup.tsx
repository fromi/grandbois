import {css} from '@emotion/core'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Failure} from '@gamepark/react-client'
import {useTheme} from 'emotion-theming'
import {TFunction} from 'i18next'
import React, {FunctionComponent} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import Theme, {LightTheme} from './Theme'
import {closePopupStyle, popupDarkStyle, popupLightStyle, popupOverlayStyle, popupPosition, popupStyle, showPopupOverlayStyle} from './util/Styles'

const FailurePopup: FunctionComponent<{ failures: string[], clearFailures: () => {} }> = ({failures, clearFailures}) => {
  const {t} = useTranslation()
  const theme = useTheme<Theme>()
  const description = failuresDescription[failures[0]] || fallbackDescription(failures[0])
  return (
    <div css={[popupOverlayStyle, showPopupOverlayStyle, style]} onClick={clearFailures}>
      <div css={[popupStyle, popupPosition, css`width: 70%`, theme.color === LightTheme ? popupLightStyle : popupDarkStyle]}
           onClick={event => event.stopPropagation()}>
        <div css={closePopupStyle} onClick={clearFailures}><FontAwesomeIcon icon={faTimes}/></div>
        <h2>{description.title(t)}</h2>
        <p>{description.text(t)}</p>
        {failures[0] === Failure.MOVE_FORBIDDEN && <p>
            <Trans defaults="If the issue remains, try to <0>reload the game</0>"
                 components={[<button onClick={() => window.location.reload()}>rafraîchir la partie</button>]}/>
        </p>}
      </div>
    </div>
  )
}

const failuresDescription = {
  [Failure.NETWORK]: {
    title: (t: TFunction) => t('Whoops…'),
    text: (t: TFunction) => t('An action could not be completed and was canceled. Are you still connected to the Internet?')
  },
  [Failure.MOVE_FORBIDDEN]: {
    title: (t: TFunction) => t('Move unauthorized!'),
    text: (t: TFunction) => t('The action you played is not allowed.')
  },
  [Failure.UNDO_FORBIDDEN]: {
    title: (t: TFunction) => t('Too late!'),
    text: (t: TFunction) => t('The other players have already played, your move could not be canceled.')
  },
  [Failure.TUTORIAL_MOVE_EXPECTED]: {
    title: (t: TFunction) => t('Move not expected in the tutorial'),
    text: (t: TFunction) => t('You will soon be free to make your own choices! Let us show you the last information…')
  }
}

const fallbackDescription = (failure: string) => ({
  title: (t: TFunction) => t('Unknown error:'),
  text: () => failure
})

const style = css`
  background: rgba(0, 0, 0, 0.5);
`

export default FailurePopup
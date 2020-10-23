import {css} from '@emotion/core'
import {GameSpeed, useOptions, usePlayer} from '@gamepark/workshop'
import React, {FunctionComponent} from 'react'
import {useTranslation} from 'react-i18next'
import Player from '../types/Player'
import PlayerView from '../types/PlayerView'
import {playerPanelHeight, playerPanelRightMargin, playerPanelWidth, playerPanelY} from '../util/Styles'
import Timer from './Timer'
import TowerColor from '../clans/TowerColor'
import {getTowerName, towerImage} from '../clans/TowerInfo'

type Props = {
  player: Player | PlayerView
  position: number
  highlight: boolean
  showScore: boolean
} & React.HTMLAttributes<HTMLDivElement>

const PlayerPanel: FunctionComponent<Props> = ({player, position, highlight, showScore, ...props}) => {
  const {t} = useTranslation()
  const options = useOptions()
  const playerInfo = usePlayer<TowerColor>(player.tower)
  return (
    <div css={style(player.tower, position, highlight)} {...props}>
      <img alt={t('Tour du joueur')} src={towerImage[player.tower]} css={towerStyle} draggable="false"/>
      <h3 css={[titleStyle, player.eliminated && eliminatedStyle]}>
        <span css={nameStyle}>{playerInfo?.name || getTowerName(t, player.tower)}</span>
        {options?.speed === GameSpeed.RealTime && playerInfo?.time?.playing && <Timer time={playerInfo.time}/>}
      </h3>
    </div>
  )
}

const style = (tower: TowerColor, position: number, highlight: boolean) => css`
  position: absolute;
  z-index: 1;
  top: ${playerPanelY(position)}%;
  right: ${playerPanelRightMargin}%;
  width: ${playerPanelWidth}%;
  height: ${playerPanelHeight}%;
  border-radius: 5px;
  ${borderStyle(highlight)};
  
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 5px;
  }
`

const borderStyle = (highlight: boolean) => highlight ? css`
  border: 0.2em solid gold;
  box-shadow: 0.2em 0.2em 1em gold;
` : css`
  border: 0.2em solid lightslategrey;
  box-shadow: 0.2em 0.2em 1em black;
`

const towerStyle = css`
  position: absolute;
  height: 90%;
  top: 5%;
  left: 1%;
`

const titleStyle = css`
  color: #333333;
  position: absolute;
  top: 5%;
  left: 20%;
  right: 2%;
  height: 90%;
  margin: 0;
  font-size: 2.9em;
  line-height: 3em;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const nameStyle = css`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const eliminatedStyle = css`
  text-decoration: line-through;
`

export default PlayerPanel
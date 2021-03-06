import {css} from '@emotion/core'
import React, {FC, useEffect, useRef, useState} from 'react'
import Images from '../material/Images'
import Clan from '@gamepark/grandbois/material/Clan'
import {useTranslation} from 'react-i18next'
import GameView from '@gamepark/grandbois/GameView'
import {tiles} from '@gamepark/grandbois/material/Tiles'
import {isTroop, Space} from '@gamepark/grandbois/material/Tile'
import VictoryPointsMultiplier from '../players/VictoryPointsMultiplier'
import TowerColor from '@gamepark/grandbois/material/TowerColor'
import {fadeIn} from '../util/Styles'
import ReactTooltip from 'react-tooltip'

type Props = { game: GameView, clan?: Clan, showScore: boolean, tower: TowerColor } & React.HTMLAttributes<HTMLDivElement>

const ClanCard : FC<Props> = (({game, clan, showScore, tower, ...props}) => {
    const {t} = useTranslation()
    const [showClanCard, setShowClanCard] = useState(showScore)
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
      if (ref.current) {
        ReactTooltip.show(ref.current)
      }
    }, [ref])
    return (
      <div ref={ref} {...props} data-place='left' data-tip={ game.over ? clan : t('Hold the click on this tile to look at your Secret Clan') }
           onMouseDown={() => setShowClanCard(true)} onMouseUp={() => !showScore && setShowClanCard(false)}
           onMouseLeave={() => !showScore && setShowClanCard(false)}
           onTouchStart={() => setShowClanCard(true)} onTouchEnd={() => !showScore && setShowClanCard(false)}
      >
        <h3 css={[headerStyle, !showClanCard && showStyle]}>{t('Secret Clan tile')}</h3>
        <div css={[scaleClanStyle, showClanCard && !game.over && scaleStyle]}>
          <div css={[style(clan), (showClanCard || game.over) && flipStyle]}/>
        </div>
        {clan && !game.over && [1, 2, 3, 4].map(index =>
          <span key={index} css={[spaceCounterStyle(index), showClanCard && showStyle]}>x{getSpaceClanCount(game, index, clan)}</span>
        )}
        {clan && !game.over && showClanCard &&
        <div css={ruleStyle}>
            <h3>{t('Victory points reminder')}</h3>
            <VictoryPointsMultiplier css={multiplierStyle} item={0} clans={[clan]} tower={tower} multiplier={1} legend={true}/>
            <VictoryPointsMultiplier css={multiplierStyle} item={1} clans={[clan]} tower={tower} multiplier={2} legend={true}/>
            <VictoryPointsMultiplier css={multiplierStyle} item={2} clans={[clan]} tower={tower} multiplier={2} legend={true}/>
            <VictoryPointsMultiplier css={multiplierStyle} item={3} clans={[clan]} tower={tower} multiplier={1} legend={true}/>
        </div>
        }
      </div>
    )
  }
)

const scaleClanStyle = css`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 200%;
  height: 200%;
  transform: scale(0.5);
  transform-origin: bottom right;
  transition: transform 0.5s ease-in-out;
  z-index: 2;
`

const style = (clan?: Clan) => css`
  position: relative;
  border-radius: 6%;
  box-shadow: 0 0 5px black;
  transform-style: preserve-3d;
  cursor: pointer;
  width: 100%;
  height: 100%;
  transform: translateZ(0);
  will-change: transform;
  transition: transform 0.5s ease-in-out;

  &:before, &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background-size: cover;
    border-radius: 6%;
  }

  &:before {
    background-image: url(${Images.cardClanBack});
  }

  &:after {
    background-image: url(${clan ? images.get(clan) : Images.cardClanBack});
    transform: rotateY(180deg);
  }
`

const scaleStyle = css`
  transform: scale(1);
`

const flipStyle = css`
  transform: rotateY(180deg);
`

const headerStyle = css`
  position: absolute;
  bottom: 105%;
  right: 0;
  z-index: 3;
  font-weight: bold;
  color: #fff381;
  text-shadow: 0 0 0.1em black;
  font-size: 1.5em;
  margin: 0;
  opacity: 0;
  transition: opacity 0.7s ease-out;
  height: auto;
  width: auto;
`

const spaceCounterStyle = (index: number) => css`
  position: absolute;
  z-index: 6;
  font-weight: bold;
  color: #FFF;
  background: #000;
  font-size: 1.8em;
  right: 0;
  top: ${(index - 1) * 45 - 95}%;
  width: 20%;
  height: 20%;
  border-radius: 100%;
  text-align: center;
  line-height: 1.6em;
  opacity: 0;
  transition: opacity 0.7s ease-in;
`

const showStyle = css`
  opacity: 1;
`

const ruleStyle = css`
  position: absolute;
  height: 200%;
  width: 240%;
  top: -100%;
  left: -330%;
  padding: 1em;
  border-radius: 1em;
  background-color: rgba(255, 255, 255, 0.8);
  border: 0.2em solid lightslategrey;
  box-shadow: 0.2em 0.2em 1em black;
  z-index: 1;
  animation: ${fadeIn} 2s ease-in forwards;

  & h3 {
    font-size: 2em;
    margin: 0.5em 0;
  }
`
const multiplierStyle = css`
  height: 22%;
  justify-content: flex-start;

`

const images = new Map<Clan, any>()

images.set(Clan.Toad, Images.cardToads)
images.set(Clan.Rabbit, Images.cardRabbits)
images.set(Clan.Fox, Images.cardFoxes)
images.set(Clan.Raccoon, Images.cardRaccoons)
images.set(Clan.Lizard, Images.cardLizards)

function getSpaceClanCount(game: GameView, number: number, clan: Clan) {
  let clanCounter: number
  let space: Space
  switch (number) {
    case 1 :
      clanCounter = 7
      break
    case 2 :
      clanCounter = 7
      break
    case 3 :
      clanCounter = 6
      break
    case 4 :
      clanCounter = 3
      break
    default :
      return 0
  }
  for (const placedTile of game.forest) {
    for (let i = 0; i < 4; i++) {
      space = tiles[placedTile.tile][i]
      if (isTroop(space) && space.clan === clan && space.size === number) clanCounter--
    }
  }
  return clanCounter
}

export default ClanCard
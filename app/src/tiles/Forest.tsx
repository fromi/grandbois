import {css} from '@emotion/core'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import GameView from '@gamepark/grandbois/GameView'
import {isPlacedTile} from '@gamepark/grandbois/material/PlacedTile'
import {Clearing} from '@gamepark/grandbois/material/Tile'
import {tiles} from '@gamepark/grandbois/material/Tiles'
import TowerColor from '@gamepark/grandbois/material/TowerColor'
import {activePlayerCanPlaceTower, getForestView, getPlacedTileSpaceXY, getPlayerName, isAvailablePosition} from '@gamepark/grandbois/Rules'
import {useDisplayState, usePlay, usePlayerId, usePlayers} from '@gamepark/react-client'
import {DragDropManager} from 'dnd-core/lib/interfaces'
import React, {FunctionComponent, useContext, useEffect, useRef, useState} from 'react'
import {DndContext, DropTargetMonitor, useDrag, useDrop, XYCoord} from 'react-dnd'
import {getEmptyImage} from 'react-dnd-html5-backend'
import {useTranslation} from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import ChangeActivePlayer, {changeActivePlayer} from '../../../rules/src/moves/ChangeActivePlayer'
import PlaceTower, {placeTower} from '../../../rules/src/moves/PlaceTower'
import {towerImage} from '../clans/TowerInfo'
import DraggedTile from '../drag-objects/DraggedTile'
import {forestArea} from '../drag-objects/ForestArea'
import Images from '../material/Images'
import Button from '../util/Button'
import {
  button, closeButton, forestCardStyle, forestCardX, forestCardY, forestHeight, forestLeft, forestSpaceHeight, forestSpaceWidth, forestTop, forestWidth,
  getCardFocusTransform, popupBackgroundStyle, riverLeft, screenRatio, spaceHeight, spaceWidth
} from '../util/Styles'
import {riverTileTop} from './River'
import TileCard from './TileCard'

type Props = {
  game: GameView
}

const Forest: FunctionComponent<Props> = ({game}) => {
  const {t} = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const [, dropRef] = useDrop({
    accept: 'Tile',
    canDrop: (item: DraggedTile, monitor: DropTargetMonitor) => {
      const overPosition = getForestPosition(game, item, monitor, forestCenter)
      if (!overPosition) return false
      return isAvailablePosition(getForestView(game), overPosition.x, overPosition.y)
    },
    drop: (item: DraggedTile, monitor) => {
      const overPosition = getForestPosition(game, item, monitor, forestCenter)
      return {
        tile: item.tile,
        x: overPosition!.x,
        y: overPosition!.y,
        rotation: item.rotation ?? 0
      }
    }
  })
  const [{dragging}, dragRef, preview] = useDrag({
      item: {type: forestArea},
      collect: monitor => ({
        dragging: monitor.isDragging()
      })
    }
  )
  useEffect(() => {
    preview(getEmptyImage())
  }, [preview])
  const dragOffsetDiff = useDragOffsetDiff(dragging)
  const [forestCenter, setForestCenter] = useDisplayState<XYCoord>(initialForestPosition)
  useEffect(() => {
    if (!dragging && dragOffsetDiff && (dragOffsetDiff.x || dragOffsetDiff.y))
      setForestCenter({
          x: forestCenter.x + dragOffsetDiff.x,
          y: forestCenter.y + dragOffsetDiff.y
        }
      )
  }, [dragOffsetDiff, dragging, forestCenter, setForestCenter])
  dragRef(dropRef(ref))
  const playerId = usePlayerId<TowerColor>()
  const play = usePlay<PlaceTower | ChangeActivePlayer>()
  const playersInfo = usePlayers<TowerColor>()
  const [focusedTile, setFocusedTile] = useState<number>()
  const [towersPlaced, setTowersPlaced] = useState<number>(0)
  useEffect(() => {
    if (towersPlaced < countTowerPlaced(game)) {
      ReactTooltip.rebuild()
      setTowersPlaced(countTowerPlaced(game))
    }
  }, [towersPlaced, game] )
  return <div css={style} ref={ref}>
    {focusedTile !== undefined &&
    <>
        <div css={popupBackgroundStyle} onClick={() => setFocusedTile(undefined)}/>
        <button css={[button, closeButton]} onClick={() => setFocusedTile(undefined)}><FontAwesomeIcon icon={faTimes}/>{t('Close')}</button>
        <TileCard tile={tiles[focusedTile]}
                  css={[forestCardStyle, getCardFocusTransform(game.forest.find(placedTile => placedTile.tile === focusedTile)!.rotation)]}/>
    </>
    }
    <div css={forestStyle(forestCenter.x + (dragOffsetDiff?.x ?? 0), forestCenter.y + (dragOffsetDiff?.y ?? 0))}>
      {
        game.forest.map((placedTile) =>
          <TileCard key={placedTile.tile}
                    tile={tiles[placedTile.tile]}
                    css={[forestCardStyle,
                      css`
                         left: ${forestCardX(placedTile.x)}%;
                         top: ${forestCardY(placedTile.y)}%;
                         transform: rotate(${90 * placedTile.rotation}deg);
                          `,
                      !game.over && game.forest.indexOf(placedTile) === (game.forest.length - 1) && lastTileStyle
                    ]}
                    onClick={() => setFocusedTile(placedTile.tile)}
          />)
      }
      {
        game.players.map(player =>
          player.towersPosition.map((towerPosition, index) =>
            <div key={player.tower+index} css={towerStyle(player.tower, towerPosition.x, towerPosition.y)}
                 data-tip={player.tower === playerId ? t('Your Watchtower') : t('{playerName} Watchtower', {playerName: (playersInfo.find(p => p.id === player.tower)!.name || getPlayerName(player.tower, t))})}/>
          )
        )
      }
      {
        playerId && playerId === game.activePlayer && activePlayerCanPlaceTower(game) &&
        <div css={towerChoiceStyle(getTowerChoicePosition(game))}>
          {t('Would you like to place your Watchtower here?')}
            <Button css={css`margin:10px`} onClick={() => play(placeTower())}>{t('Yes')}</Button>
            <Button css={css`margin:10px`} onClick={() => play(changeActivePlayer())}>{t('No')}</Button>
        </div>
      }
    </div>
  </div>
}

export const initialForestPosition = {x: 0, y: 0}

function getTowerChoicePosition(game: GameView) {
  const lastTile = game.forest[game.forest.length - 1]
  const clearingIndex = tiles[lastTile.tile].findIndex(space => space === Clearing)
  return getPlacedTileSpaceXY(lastTile, clearingIndex)
}

function countTowerPlaced(game:GameView){
  return game.players.reduce((sum, player) => sum + player.towersPosition.length, 0)
}

const style = css`
  position: absolute;
  top: ${forestTop}%;
  left: ${forestLeft}%;
  width: ${forestWidth}%;
  height: ${forestHeight}%;
`
const forestStyle = (deltaX: number, deltaY: number) => css`
  transform:translate(${deltaX}px,${deltaY}px);
  width:100%;
  height:100%;
`

const lastTileStyle = css`
  border: 0.2em solid white;
  box-shadow: 0.2em 0.2em 1em white;
`

const towerStyle = (tower: TowerColor, x: number, y: number) => css`
  position:absolute;
  left: ${forestCardX(x)}%;
  top: ${forestCardY(y) - 2}%;
  width: ${forestSpaceWidth}%;
  height: ${forestSpaceHeight + 2}%;
  z-index:3;
  background-image: url(${towerImage[tower]});
  filter: drop-shadow(0.1em 0.1em 0.4em white);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center center;
`

const images = new Map<TowerColor, any>()
images.set(TowerColor.WhiteTower, Images.whiteTower)
images.set(TowerColor.BlueTower, Images.blueTower)
images.set(TowerColor.BlackTower, Images.blackTower)
images.set(TowerColor.BrownTower, Images.brownTower)

const towerChoiceStyle = (clearingSpace: XYCoord) => css`
  position:absolute;
  left: ${forestCardX(clearingSpace.x) + (spaceWidth / 2)}%;
  top: ${forestCardY(clearingSpace.y) + (spaceHeight / 2)}%;
  width:20%;
  font-size:2.5em;
  padding:0.5em;
  z-index:5;
  background-image: url(${Images.woodTexture});
  background-position: center center;
  background-repeat: repeat;
  background-size: cover;
  border-radius: 0 1em 1em 1em;
  border: solid 0.1em #8b4513;
  box-shadow: 0 0 1em #000;
  text-align:center;
  color:#fff381;
`

function getForestPosition(game: GameView, item: DraggedTile, monitor: DropTargetMonitor, forestCenter: XYCoord) {

  const position = monitor.getDifferenceFromInitialOffset()
  if (!position) return
  const percent = convertIntoPercent(position)
  const deltaForest = convertIntoPercent(forestCenter)
  let overPosition: XYCoord
  if (isPlacedTile(item)) {
    // drop tile from the forest
    overPosition = getInsideForestCoordinates(item, percent)
  } else
    // drop tile from the river
    overPosition = getForestCoordinates(game, item.tile, percent, deltaForest)

  return overPosition
}

export const convertIntoPercent = (coordinates: XYCoord) => ({
  x: window.innerWidth / window.innerHeight > screenRatio ? coordinates.x * 100 / (window.innerHeight * screenRatio) : coordinates.x * 100 / window.innerWidth,
  y: window.innerWidth / window.innerHeight > screenRatio ? coordinates.y * 100 / window.innerHeight : coordinates.y * 100 / (window.innerWidth / screenRatio)
})

const getForestCoordinates = (game: GameView, tile: number, coordinates: XYCoord, delta: XYCoord) => ({
  x: Math.round((coordinates.x - delta.x + riverLeft - forestLeft - (forestWidth / 2) + spaceWidth) / spaceWidth),
  y: Math.round((coordinates.y - delta.y + riverTileTop(game, tile) - forestTop - (forestHeight / 2) + spaceHeight) / spaceHeight)
})

const getInsideForestCoordinates = (playingTile: DraggedTile, coordinates: XYCoord) => ({
  x: Math.round(playingTile.x! + (coordinates.x / spaceWidth)),
  y: Math.round(playingTile.y! + (coordinates.y / spaceHeight))
})

const useDragOffsetDiff = (enabled: boolean, fps = 60) => {
  const {dragDropManager} = useContext(DndContext)
  const monitor = (dragDropManager as DragDropManager).getMonitor()
  const [dragOffsetDiff, setDragOffsetDiff] = useState(monitor.getDifferenceFromInitialOffset())
  const offsetChangeListener = () => setDragOffsetDiff(monitor.getDifferenceFromInitialOffset())
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>()
  const cleanup = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setDragOffsetDiff({x: 0, y: 0})
    }
  }
  useEffect(() => {
    if (enabled) {
      setIntervalId(setInterval(() => {
        offsetChangeListener()
      }, 1000 / fps))
    } else {
      cleanup()
    }
    return cleanup
  }, [enabled])
  return dragOffsetDiff
}

export default Forest
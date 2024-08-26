// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { TournamentTreeNode } from '../../../types/tournament'


interface TreeNodeProps {
  nodeDatum: TournamentTreeNode
  onNodeClick: () => void
}

const NODE_WIDTH = 200
const NODE_X_SHIFT = -(NODE_WIDTH / 2)
const NODE_HEIGHT = 60
const NODE_Y_SHIFT = -(NODE_HEIGHT / 2)
const NODE_BACKGROUND = 'white'

const NAME_FONT_SIZE = 16
const NAME_PADDING_LEFT = 5
const NAME_BACKGROUND_HEIGHT = 20
const NAME_BACKGROUND_PADDING_VERTICAL = ((NODE_HEIGHT / 2) - NAME_BACKGROUND_HEIGHT) / 2
const POINTS_BACKGROUND_WIDTH = 20

export const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { nodeDatum, onNodeClick } = props
  const fight = nodeDatum.attributes.fight

  const ready = fight.redUuid !== '' && fight.blueUuid !== ''
  const finished = fight.winner !== undefined
  const redFontWeight = (fight.winner === 'RED' ? 'bold' : 'normal')
  const blueFontWeight = (fight.winner === 'BLUE' ? 'bold' : 'normal')

  if (fight.type === 'REPECHAGE_ROOT') {
    return (
      <rect
        className="repechage-root"
        strokeWidth={0}
        width={400}
        height={200}
        x={-400}
        y={-100}
      />
    )
  }

  return (
    <g
      cursor={ready ? 'pointer' : 'not-allowed'}
      onClick={onNodeClick}
    >
      {/* Node background */}
      <rect
        fill={NODE_BACKGROUND}
        strokeWidth={1}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        x={NODE_X_SHIFT}
        y={NODE_Y_SHIFT}
      />
      {/* Red name and color */}
      <rect
        fill={fight.redUuid === '' ? NODE_BACKGROUND : '#fc6969'}
        strokeWidth={0}
        width={NODE_WIDTH}
        height={NAME_BACKGROUND_HEIGHT}
        x={NODE_X_SHIFT}
        y={NODE_Y_SHIFT + NAME_BACKGROUND_PADDING_VERTICAL}
      />
      <text
        fill="black"
        fontWeight={redFontWeight}
        fontSize={NAME_FONT_SIZE}
        strokeWidth={0}
        dominantBaseline="middle"
        x={NODE_X_SHIFT + NAME_PADDING_LEFT}
        y={NODE_Y_SHIFT + NAME_BACKGROUND_PADDING_VERTICAL + NAME_BACKGROUND_HEIGHT / 2}
      >
        {fight.redName}
      </text>
      {/* Red points */}
      <rect
        fill="grey"
        strokeWidth={0}
        width={POINTS_BACKGROUND_WIDTH}
        height={NAME_BACKGROUND_HEIGHT}
        x={NODE_X_SHIFT + NODE_WIDTH - POINTS_BACKGROUND_WIDTH}
        y={NODE_Y_SHIFT + NAME_BACKGROUND_PADDING_VERTICAL}
      />
      <text
        fill="white"
        fontWeight={redFontWeight}
        fontSize={NAME_FONT_SIZE}
        strokeWidth={0}
        dominantBaseline="middle"
        textAnchor="middle"
        x={NODE_X_SHIFT + NODE_WIDTH - POINTS_BACKGROUND_WIDTH / 2}
        y={NODE_Y_SHIFT + NAME_BACKGROUND_PADDING_VERTICAL + NAME_BACKGROUND_HEIGHT / 2}
      >
        {finished ? fight.redPoints : '-'}
      </text>
      {/* Blue name and color */}
      <rect
        fill={fight.blueUuid === '' ? NODE_BACKGROUND : '#78abfd'}
        strokeWidth={0}
        width={NODE_WIDTH}
        height={NAME_BACKGROUND_HEIGHT}
        x={NODE_X_SHIFT}
        y={NAME_BACKGROUND_PADDING_VERTICAL}
      />
      <text
        fill="black"
        fontWeight={blueFontWeight}
        fontSize={NAME_FONT_SIZE}
        strokeWidth={0}
        dominantBaseline="middle"
        x={NODE_X_SHIFT + NAME_PADDING_LEFT}
        y={NAME_BACKGROUND_PADDING_VERTICAL + NAME_BACKGROUND_HEIGHT / 2}
      >
        {fight.blueName}
      </text>
      {/* Blue points */}
      <rect
        fill="grey"
        strokeWidth={0}
        width={POINTS_BACKGROUND_WIDTH}
        height={NAME_BACKGROUND_HEIGHT}
        x={NODE_X_SHIFT + NODE_WIDTH - POINTS_BACKGROUND_WIDTH}
        y={NAME_BACKGROUND_PADDING_VERTICAL}
      />
      <text
        fill="white"
        fontWeight={blueFontWeight}
        fontSize={NAME_FONT_SIZE}
        strokeWidth={0}
        dominantBaseline="middle"
        textAnchor="middle"
        x={NODE_X_SHIFT + NODE_WIDTH - POINTS_BACKGROUND_WIDTH / 2}
        y={NAME_BACKGROUND_PADDING_VERTICAL + NAME_BACKGROUND_HEIGHT / 2}
      >
        {finished ? fight.bluePoints : '-'}
      </text>
      {/* Node border */}
      <rect
        fill="none"
        strokeWidth={1}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        x={NODE_X_SHIFT}
        y={NODE_Y_SHIFT}
      />
    </g>
  )
}

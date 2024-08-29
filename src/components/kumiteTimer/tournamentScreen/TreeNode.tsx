// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { TournamentTreeNode } from '../../../types/tournament'
import {
  NAME_BACKGROUND_HEIGHT,
  NAME_BACKGROUND_PADDING_VERTICAL,
  NAME_FONT_SIZE,
  NAME_PADDING_LEFT,
  NODE_BACKGROUND,
  NODE_HEIGHT,
  NODE_WIDTH,
  NODE_X_SHIFT,
  NODE_Y_SHIFT,
  POINTS_BACKGROUND_WIDTH,
  TREE_LEVEL_X_SHIFT,
  TREE_LEVEL_Y_SHIFT,
} from './treeLayoutConstants'


interface TreeNodeProps {
  nodeDatum: TournamentTreeNode
  onNodeClick: () => void
}

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
        cursor="grab"
        className="repechage-root"
        strokeWidth={0}
        width={TREE_LEVEL_X_SHIFT}
        height={2 * TREE_LEVEL_Y_SHIFT}
        x={-TREE_LEVEL_X_SHIFT}
        y={-TREE_LEVEL_Y_SHIFT}
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

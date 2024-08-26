// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import Tree from 'react-d3-tree'
import './TournamentScreen.scss'
import { TreeNode } from './TreeNode'
import { Fight } from '../../../types/tournament'


export interface FightNodeDatum {
  name: string
  attributes: {
    fight: Fight,
  }
  children?: FightNodeDatum[]
}

const data: FightNodeDatum = {
  name: 'CEO',
  attributes: {
    fight: {
      uuid: 'uuid',
      depth: 0,
      winner: 'RED',
      redUuid: 'red',
      redName: 'RED',
      redPoints: 5,
      redFouls: 0,
      blueUuid: 'blue',
      blueName: 'BLUE',
      bluePoints: 2,
      blueFouls: 0,
      senchu: 'NONE',
      winnerGoesTo: undefined,
      oppositeFight: undefined,
    },
  },
  children: [
    {
      name: 'Foreman',
      attributes: {
        fight: {
          uuid: 'uuid',
          depth: 0,
          winner: undefined,
          redUuid: 'red',
          redName: 'RED',
          redPoints: 0,
          redFouls: 0,
          blueUuid: 'blue',
          blueName: 'BLUE',
          bluePoints: 0,
          blueFouls: 0,
          senchu: 'NONE',
          winnerGoesTo: undefined,
          oppositeFight: undefined,
        },
      },
      children: [
        {
          name: 'Worker',
          attributes: {
            fight: {
              uuid: 'uuid',
              depth: 0,
              winner: undefined,
              redUuid: 'red',
              redName: 'RED',
              redPoints: 0,
              redFouls: 0,
              blueUuid: 'blue',
              blueName: 'BLUE',
              bluePoints: 0,
              blueFouls: 0,
              senchu: 'NONE',
              winnerGoesTo: undefined,
              oppositeFight: undefined,
            },
          },
        },
        {
          name: 'Worker',
          attributes: {
            fight: {
              uuid: 'uuid',
              depth: 0,
              winner: undefined,
              redUuid: 'red',
              redName: 'RED',
              redPoints: 0,
              redFouls: 0,
              blueUuid: 'blue',
              blueName: 'BLUE',
              bluePoints: 0,
              blueFouls: 0,
              senchu: 'NONE',
              winnerGoesTo: undefined,
              oppositeFight: undefined,
            },
          },
        },
      ],
    },
    {
      name: 'Foreman',
      attributes: {
        fight: {
          uuid: 'uuid',
          depth: 0,
          winner: undefined,
          redUuid: 'red',
          redName: 'RED',
          redPoints: 0,
          redFouls: 0,
          blueUuid: 'blue',
          blueName: 'BLUE',
          bluePoints: 0,
          blueFouls: 0,
          senchu: 'NONE',
          winnerGoesTo: undefined,
          oppositeFight: undefined,
        },
      },
      children: [
        {
          name: 'Worker',
          attributes: {
            fight: {
              uuid: 'uuid',
              depth: 0,
              winner: undefined,
              redUuid: 'red',
              redName: 'RED',
              redPoints: 0,
              redFouls: 0,
              blueUuid: 'blue',
              blueName: 'BLUE',
              bluePoints: 0,
              blueFouls: 0,
              senchu: 'NONE',
              winnerGoesTo: undefined,
              oppositeFight: undefined,
            },
          },
        },
        {
          name: 'Worker',
          attributes: {
            fight: {
              uuid: 'uuid',
              depth: 0,
              winner: undefined,
              redUuid: 'red',
              redName: 'RED',
              redPoints: 0,
              redFouls: 0,
              blueUuid: 'blue',
              blueName: 'BLUE',
              bluePoints: 0,
              blueFouls: 0,
              senchu: 'NONE',
              winnerGoesTo: undefined,
              oppositeFight: undefined,
            },
          },
        },
      ],
    },
  ],
}

export const TreeTournamentScreen = (): JSX.Element => {
  return (
    <div className='tree-wrapper'>
      {/* @ts-expect-error - typing of attributes */}
      <Tree
        data={data}
        depthFactor={-400}
        pathFunc='step'
        renderCustomNodeElement={TreeNode}
        onNodeClick={(x) => console.log('aaa', x)}
      />
    </div>
  )
}

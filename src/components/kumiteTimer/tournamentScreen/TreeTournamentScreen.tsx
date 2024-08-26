// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import Tree from 'react-d3-tree'
import './TournamentScreen.scss'
import { TreeNode } from './TreeNode'
import { useSelector } from '../../../redux/useSelector'
import { selectKumiteTimerTournamentTree } from '../../../redux/kumiteTimer/selector'


export const TreeTournamentScreen = (): JSX.Element => {
  const tree = useSelector(selectKumiteTimerTournamentTree)

  return (
    <div className='tree-wrapper'>
      {/* @ts-expect-error - typing of attributes */}
      <Tree
        data={tree}
        depthFactor={-400}
        pathFunc='step'
        renderCustomNodeElement={TreeNode}
        onNodeClick={(x) => console.log('aaa', x)}
      />
    </div>
  )
}

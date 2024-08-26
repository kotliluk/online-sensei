// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import Tree from 'react-d3-tree'
import './TournamentScreen.scss'
import { TreeNode } from './TreeNode'
import { useSelector } from '../../../redux/useSelector'
import { selectKumiteTimerTournamentTree } from '../../../redux/kumiteTimer/selector'
import { setTournamentFight } from '../../../redux/kumiteTimer/actions'
import { TournamentTreeNode } from '../../../types/tournament'
import { useDispatch } from '../../../redux/useDispatch'


export const TreeTournamentScreen = (): JSX.Element => {
  const tree = useSelector(selectKumiteTimerTournamentTree)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleClick = useCallback((data: TournamentTreeNode | null | undefined) => {
    if (!data) {
      return
    }

    const fight = data.attributes.fight

    if (fight.redUuid !== '' && fight.blueUuid !== '') {
      dispatch(setTournamentFight(fight))
      history.push('/kumite-timer')
    }
  }, [])

  return (
    <div className='tree-wrapper'>
      {/* @ts-expect-error - typing of attributes */}
      <Tree
        data={tree}
        depthFactor={-400}
        pathFunc='step'
        renderCustomNodeElement={TreeNode}
        onNodeClick={({ data }) => handleClick(data as unknown as TournamentTreeNode)}
      />
    </div>
  )
}

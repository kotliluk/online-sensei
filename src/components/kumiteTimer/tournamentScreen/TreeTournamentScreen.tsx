import { JSX, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Tree from 'react-d3-tree'
import './TournamentScreen.scss'
import { TreeNode } from './TreeNode'
import { useSelector } from '../../../redux/useSelector'
import { selectKumiteTimerRepechageTree, selectKumiteTimerTournamentTree } from '../../../redux/kumiteTimer/selector'
import { setTournamentFight } from '../../../redux/kumiteTimer/actions'
import { getTreeDepth, openFightAction, TournamentTreeNode } from '../../../types/tournament'
import { useDispatch } from '../../../redux/useDispatch'
import { selectTranslation } from '../../../redux/page/selector'
import { setModalWindow } from '../../../redux/page/actions'
import { TREE_LEVEL_X_SHIFT, TREE_LEVEL_Y_SHIFT } from './treeLayoutConstants'


export const TreeTournamentScreen = (): JSX.Element => {
  const { kumiteTimer: { setUpScreen: { tournament: t } } } = useSelector(selectTranslation)
  const tree = useSelector(selectKumiteTimerTournamentTree)
  const repechage = useSelector(selectKumiteTimerRepechageTree)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const initTreeTranslate = useMemo(() => {
    const depth = getTreeDepth(tree)
    return { x: (depth + 1) * TREE_LEVEL_X_SHIFT, y: depth * TREE_LEVEL_Y_SHIFT }
  }, [tree])

  const initRepechageTranslate = useMemo(() => {
    const depth = getTreeDepth(repechage)
    return { x: (depth + 1) * TREE_LEVEL_X_SHIFT, y: TREE_LEVEL_Y_SHIFT }
  }, [repechage])

  const handleClick = useCallback((data: TournamentTreeNode | null | undefined) => {
    if (!data) {
      return
    }

    const fight = data.attributes.fight
    const action = openFightAction(fight, tree, repechage)

    if (action === 'NOTHING') {
      return
    }

    dispatch(setTournamentFight(fight))

    if (action === 'ASK') {
      dispatch(setModalWindow('REOPEN_TREE_FIGHT'))
    } else {
      void navigate('/kumite-timer')
    }
  }, [tree, repechage, dispatch, navigate])

  return (
    <>
      <div className='tree-wrapper'>
        {/* @ts-expect-error - typing of attributes */}
        <Tree
          data={tree}
          depthFactor={-TREE_LEVEL_X_SHIFT}
          pathFunc='step'
          translate={initTreeTranslate}
          renderCustomNodeElement={TreeNode}
          onNodeClick={({ data }) => handleClick(data as unknown as TournamentTreeNode)}
        />
      </div>
      {repechage && (
        <>
          <h2>{t.repechage}</h2>
          <div className='repechage-wrapper'>
            {/* @ts-expect-error - typing of attributes */}
            <Tree
              data={repechage}
              depthFactor={-TREE_LEVEL_X_SHIFT}
              pathFunc='step'
              translate={initRepechageTranslate}
              renderCustomNodeElement={TreeNode}
              onNodeClick={({ data }) => handleClick(data as unknown as TournamentTreeNode)}
            />
          </div>
        </>
      )}
    </>
  )
}

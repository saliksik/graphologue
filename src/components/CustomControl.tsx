import React, { memo, useCallback, useContext } from 'react'
import { ControlButton, Controls, Edge, Node, useReactFlow } from 'reactflow'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded'
import LaptopChromebookRoundedIcon from '@mui/icons-material/LaptopChromebookRounded'
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded'
import SwipeRoundedIcon from '@mui/icons-material/SwipeRounded'
import SpaceBarRoundedIcon from '@mui/icons-material/SpaceBarRounded'
// import KeyboardOptionKeyRoundedIcon from '@mui/icons-material/KeyboardOptionKeyRounded'
// import MouseRoundedIcon from '@mui/icons-material/MouseRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import UndoRoundedIcon from '@mui/icons-material/UndoRounded'
import RedoRoundedIcon from '@mui/icons-material/RedoRounded'
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded'
import TheatersRoundedIcon from '@mui/icons-material/TheatersRounded'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'

import { customAddNodes } from './Node'
import {
  adjustNewNodePositionAvoidIntersections,
  downloadData,
  getGraphBounds,
} from '../utils/utils'
import {
  hardcodedNodeSize,
  styles,
  terms,
  transitionDuration,
  viewFittingOptions,
} from '../constants'
// import { magicExplain } from '../utils/magicExplain'
import { quitZenExplain, zenExplain } from '../utils/zenExplain'

import defaultExample from '../examples/default.json'
import { FlowContext } from './Contexts'

type CustomControlsProps = {
  nodes: Node[]
  edges: Edge[]
  selectedComponents: {
    nodes: string[]
    edges: string[]
  }
  undoTime: () => void
  redoTime: () => void
  canRedo: boolean
  canUndo: boolean
  notesOpened: boolean
  setNotesOpened: (notesOpened: boolean) => void
}
export const CustomControls = memo(
  ({
    nodes,
    edges,
    selectedComponents,
    undoTime,
    redoTime,
    canUndo,
    canRedo,
    notesOpened,
    setNotesOpened,
  }: CustomControlsProps) => {
    const {
      setViewport,
      fitView,
      fitBounds,
      getViewport,
      getNodes,
      addNodes,
      setNodes,
      addEdges,
      setEdges,
      deleteElements,
      toObject,
    } = useReactFlow()
    const { zenMode, setZenMode, setZenModeLoading } = useContext(FlowContext)

    const _returnToOrigin = useCallback(() => {
      setViewport({ x: 0, y: 0, zoom: 1 }, { duration: transitionDuration })
    }, [setViewport])

    /* -------------------------------------------------------------------------- */
    // !
    const handleSetViewport = useCallback(() => {
      const nodes = getNodes()

      if (!nodes.length) return _returnToOrigin()

      const graphBonds = getGraphBounds(nodes)
      fitBounds(graphBonds, viewFittingOptions)
    }, [_returnToOrigin, fitBounds, getNodes])

    // !
    const handleAddNode = useCallback(() => {
      const { x, y, zoom } = getViewport()
      const { width, height } = hardcodedNodeSize

      // add nodes at the center of the viewport
      const { adjustedX, adjustedY } = adjustNewNodePositionAvoidIntersections(
        getNodes(),
        window.innerWidth / zoom / 2 - x / zoom - width / zoom / 2,
        window.innerHeight / zoom / 2 - y / zoom - height / zoom / 2
      )
      customAddNodes(addNodes, adjustedX, adjustedY, {
        label: '',
        editing: false,
        styleBackground: styles.nodeColorDefaultWhite,
        zenBuddy: zenMode,
        fitView,
        toFitView: true,
      })
    }, [addNodes, fitView, getNodes, getViewport, zenMode])

    // !
    const handleClearCanvas = useCallback(() => {
      // remove all nodes
      deleteElements({ nodes: getNodes() })

      return _returnToOrigin()
    }, [_returnToOrigin, deleteElements, getNodes])

    /* -------------------------------------------------------------------------- */

    // ! explain

    const handleExplain = useCallback(() => {
      zenMode
        ? quitZenExplain(
            nodes,
            edges,
            {
              edges: selectedComponents.edges,
              nodes: selectedComponents.nodes.filter(
                // you cannot explain a magic node
                (nodeId: string) => {
                  const node = nodes.find(node => node.id === nodeId)
                  return node && node.type !== 'magic'
                }
              ),
            },
            {
              setNodes,
              setEdges,
              fitView,
              setZenMode,
              setZenModeLoading,
            }
          )
        : zenExplain(
            nodes,
            edges,
            {
              edges: selectedComponents.edges,
              nodes: selectedComponents.nodes.filter(
                // you cannot explain a magic node
                (nodeId: string) => {
                  return !nodeId.includes('magic')
                }
              ),
            },
            {
              addNodes,
              setNodes,
              setEdges,
              fitView,
              setZenMode,
              setZenModeLoading,
            },
            true
          )
    }, [
      addNodes,
      edges,
      fitView,
      nodes,
      selectedComponents.edges,
      selectedComponents.nodes,
      setEdges,
      setNodes,
      setZenMode,
      setZenModeLoading,
      zenMode,
    ])

    /* -------------------------------------------------------------------------- */

    // ! notebook

    const handleToggleNotebook = useCallback(() => {
      setNotesOpened(!notesOpened)
    }, [notesOpened, setNotesOpened])

    /* -------------------------------------------------------------------------- */

    const handleSaveFile = useCallback(() => {
      downloadData(
        toObject(),
        // 'graphologue.json' with current time
        `graphologue-${new Date().toJSON().slice(0, 10)}.json`
      )
    }, [toObject])

    /* -------------------------------------------------------------------------- */

    // ! load example

    const handleLoadExample = useCallback(async () => {
      if (defaultExample) {
        const { nodes, edges } = defaultExample

        // TODO instead of clearing the canvas, preserve the current nodes and add example nodes on the side
        // clear the canvas
        handleClearCanvas()

        // add nodes
        addNodes(nodes as Node[])

        // add edges
        addEdges(edges as Edge[])

        // fit view
        setTimeout(() => fitView(viewFittingOptions), 0)
      }
    }, [addEdges, addNodes, fitView, handleClearCanvas])

    /* -------------------------------------------------------------------------- */

    const isEmptyCanvas = nodes.length === 0
    // you cannot explain a magic node
    const anyCustomNodesOrEdgesSelected =
      selectedComponents.nodes.some(nodeId => {
        const node = nodes.find(node => node.id === nodeId)
        return node && node.type !== 'magic' && node.selected
      }) || selectedComponents.edges.length > 0

    return (
      <Controls
        showZoom={false}
        showInteractive={false}
        showFitView={false}
        position="top-left"
      >
        <ControlButton className="title-button" onClick={handleSetViewport}>
          <span id="title">Graphologue</span>
          <ControlButtonTooltip>
            <TooltipLine>
              <FitScreenRoundedIcon />
              <span>fit view</span>
            </TooltipLine>
          </ControlButtonTooltip>
        </ControlButton>

        <ControlButton onClick={handleAddNode}>
          <AddRoundedIcon />
          <span>add node</span>
        </ControlButton>

        <ControlButton
          className={isEmptyCanvas ? 'disabled-control-button' : ''}
          onClick={handleClearCanvas}
        >
          <GridOnRoundedIcon />
          <span>clear</span>
        </ControlButton>

        <ControlButton
          className={
            'explain-button' +
            (anyCustomNodesOrEdgesSelected || zenMode
              ? ''
              : ' disabled-control-button')
          }
          onClick={handleExplain}
        >
          {zenMode ? (
            <>
              <AutoFixHighRoundedIcon className="control-button-explain-icon" />
              <span>return</span>
              <ControlButtonTooltip>
                <TooltipLine>
                  <span>return to main graph</span>
                </TooltipLine>
              </ControlButtonTooltip>
            </>
          ) : (
            <>
              <AutoFixHighRoundedIcon className="control-button-explain-icon" />
              <span>explain</span>
              <ControlButtonTooltip>
                <TooltipLine>
                  <span>ask {terms.gpt}</span>
                </TooltipLine>
              </ControlButtonTooltip>
            </>
          )}
        </ControlButton>

        <ControlButton
          onClick={handleToggleNotebook}
          className={notesOpened ? 'button-highlighted' : ''}
        >
          <FormatListBulletedRoundedIcon />
          <span>notes</span>
          <ControlButtonTooltip>
            <TooltipLine>
              {notesOpened ? 'close notebook' : 'open notebook'}
            </TooltipLine>
          </ControlButtonTooltip>
        </ControlButton>

        <ControlButton
          className={canUndo ? '' : ' disabled-control-button'}
          onClick={undoTime}
        >
          <UndoRoundedIcon />
          <ControlButtonTooltip>
            <TooltipLine>
              {/* <KeyboardCommandKeyRoundedIcon /> + z */}
              undo
            </TooltipLine>
          </ControlButtonTooltip>
        </ControlButton>

        <ControlButton
          className={canRedo ? '' : 'disabled-control-button'}
          onClick={redoTime}
        >
          <RedoRoundedIcon />
          <ControlButtonTooltip>
            <TooltipLine>
              {/* <KeyboardCommandKeyRoundedIcon /> + x */}
              redo
            </TooltipLine>
          </ControlButtonTooltip>
        </ControlButton>

        <ControlButton onClick={handleSaveFile}>
          <FileDownloadRoundedIcon />
          <span>save</span>
          {/* <ControlButtonTooltip>
            <TooltipLine>save as a file</TooltipLine>
          </ControlButtonTooltip> */}
        </ControlButton>

        <ControlButton onClick={handleLoadExample}>
          <TheatersRoundedIcon />
          <span>examples</span>
          {/* <ControlButtonTooltip>
            <TooltipLine>coming soon</TooltipLine>
          </ControlButtonTooltip> */}
        </ControlButton>

        <ControlButton className="tips-button">
          <LightbulbRoundedIcon className="control-button-tips-icon" />
          <span className="control-button-tips">tips</span>

          <ControlButtonTooltip>
            <TooltipLine>
              <LaptopChromebookRoundedIcon />
              <span>
                use <strong>Chrome</strong> for best experience
              </span>
            </TooltipLine>
            <TooltipLine>
              <SwipeRoundedIcon />
              <span>
                scroll to <strong>pan around</strong>
              </span>
            </TooltipLine>
            <TooltipLine>
              {/* <KeyboardOptionKeyRoundedIcon /> */}
              <SpaceBarRoundedIcon />
              <span>
                press Space key to <strong>connect</strong>
              </span>
            </TooltipLine>
            <TooltipLine>
              <EditRoundedIcon />
              <span>
                double click to <strong>edit text</strong>
              </span>
            </TooltipLine>
          </ControlButtonTooltip>
        </ControlButton>
      </Controls>
    )
  }
)

const ControlButtonTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="control-button-tooltip pointer-events-no">{children}</div>
)

const TooltipLine = ({ children }: { children: React.ReactNode }) => (
  <div className="tooltip-line">{children}</div>
)

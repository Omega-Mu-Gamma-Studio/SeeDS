import NodeGraphRenderer from './NodeGraphRenderer.jsx'
import BarsRenderer from './BarsRenderer.jsx'
import BucketsRenderer from './BucketsRenderer.jsx'
import ArrayTreeDualRenderer from './ArrayTreeDualRenderer.jsx'
import './VisualizerDispatch.css'

/**
 * Dispatch entry point per PRD §7 — reads visual.rendererType and hands off
 * to the matching renderer component. Lesson content never needs to know
 * which component actually draws it. Written as an explicit switch (rather
 * than a dynamic component variable from a lookup table) so each branch is
 * a statically-known JSX element.
 */
export default function VisualizerDispatch({ visual, ...rest }) {
  if (!visual) return null
  const key = JSON.stringify(visual.data)

  switch (visual.rendererType) {
    case 'bars':
      return <BarsRenderer key={key} data={visual.data} {...rest} />
    case 'buckets':
      return <BucketsRenderer key={key} data={visual.data} {...rest} />
    case 'array-tree-dual':
      return <ArrayTreeDualRenderer key={key} data={visual.data} {...rest} />
    case 'node-graph':
    default:
      return <NodeGraphRenderer key={key} data={visual.data} {...rest} />
  }
}

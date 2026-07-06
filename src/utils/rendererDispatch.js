// Maps a lesson's visual.rendererType (PRD §7) to the component that knows
// how to draw it. Adding a new visualization style later means adding a case
// here, not touching the existing renderers.

import NodeGraphRenderer from '../components/visualizers/NodeGraphRenderer.jsx'
import BarsRenderer from '../components/visualizers/BarsRenderer.jsx'
import BucketsRenderer from '../components/visualizers/BucketsRenderer.jsx'
import ArrayTreeDualRenderer from '../components/visualizers/ArrayTreeDualRenderer.jsx'

const RENDERERS = {
  'node-graph': NodeGraphRenderer,
  'bars': BarsRenderer,
  'buckets': BucketsRenderer,
  'array-tree-dual': ArrayTreeDualRenderer,
}

export function getRendererComponent(rendererType) {
  return RENDERERS[rendererType] || NodeGraphRenderer
}

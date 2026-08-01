import NodeGraphRenderer from './NodeGraphRenderer.jsx'
import GridRenderer from './GridRenderer.jsx'
import BucketsRenderer from './BucketsRenderer.jsx'
import ArrayTreeDualRenderer from './ArrayTreeDualRenderer.jsx'
import './VisualizerDispatch.css'

/**
 * Dispatch entry point per PRD §7 — reads visual.rendererType and hands off
 * to the matching renderer component. Lesson content never needs to know
 * which component actually draws it. Written as an explicit switch (rather
 * than a dynamic component variable from a lookup table) so each branch is
 * a statically-known JSX element.
 *
 * Keying: pass `lessonId` (ANIMATION_ADDENDUM.md §7) whenever `visual.data`
 * can change *within* the same lesson — e.g. a step player advancing through
 * a `steps` log. Keying on lessonId instead of JSON.stringify(visual.data)
 * means the renderer instance survives a step change instead of getting torn
 * down and rebuilt every time, which is what lets useNodeTween animate a
 * node moving from step N to step N+1 rather than just snapping to a brand
 * new position on a brand-new component. It still remounts cleanly on an
 * actual lesson swap, so no Konva/tween state leaks between lessons.
 * Callers that never mutate `visual.data` in place (e.g. Phase4's static
 * broken-state visual) can omit `lessonId` and keep the old data-keyed
 * behavior.
 */
export default function VisualizerDispatch({ visual, lessonId, ...rest }) {
  if (!visual) return null
  const key = lessonId ?? JSON.stringify(visual.data)

  switch (visual.rendererType) {
    case 'number-grid':
      return <GridRenderer key={key} data={visual.data} {...rest} />
    case 'buckets':
      return <BucketsRenderer key={key} data={visual.data} {...rest} />
    case 'array-tree-dual':
      return <ArrayTreeDualRenderer key={key} data={visual.data} {...rest} />
    case 'node-graph':
    default:
      return <NodeGraphRenderer key={key} data={visual.data} {...rest} />
  }
}

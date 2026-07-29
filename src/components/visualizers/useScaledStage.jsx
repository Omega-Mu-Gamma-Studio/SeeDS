import { useRef, useState, useLayoutEffect } from 'react'
import { Stage, Layer } from 'react-konva'

// Measures the wrapping element and reports its content-box size,
// updating on resize so a Stage can be scaled to fit instead of
// overflowing and getting silently clipped by the parent's
// `overflow: hidden` safety net.
export function useContainerSize(fallback = { width: 640, height: 340 }) {
  const ref = useRef(null)
  const [size, setSize] = useState(fallback)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size]
}

// Wraps Stage content in a scaled+centered Layer sized to the natural
// (unscaled) diagram dimensions, so it shrinks to fit the actual panel
// width instead of overflowing and being clipped.
export function ScaledStage({ containerSize, naturalWidth, naturalHeight, children }) {
  const scale = Math.min(
    containerSize.width / naturalWidth,
    containerSize.height / naturalHeight,
    1 // never upscale past 1:1
  ) || 1
  const offsetX = (containerSize.width - naturalWidth * scale) / 2
  const offsetY = (containerSize.height - naturalHeight * scale) / 2
  return (
    <Stage width={containerSize.width} height={containerSize.height}>
      <Layer x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
        {children}
      </Layer>
    </Stage>
  )
}

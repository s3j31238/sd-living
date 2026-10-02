import React from 'react'
import { Environment, Lightformer } from '@react-three/drei'

/**
 * A self-contained image-based lighting rig.
 *
 * Why not `<Environment preset="…" />`? Two reasons:
 *
 *  1. The presets are HDRIs fetched from a CDN at runtime. That is an
 *     external network dependency on every page load, and it fails
 *     outright in sandboxed/offline contexts.
 *  2. The "apartment" preset is a daylight interior with a hard-edged
 *     window. Reflected in a semi-gloss acrylic plate it painted a
 *     bright rectangle with a razor-sharp vertical seam straight across
 *     the hero product.
 *
 * Instead we bake a tiny 128px cube from a handful of broad, warm
 * area lights — soft gradients only, nothing with an edge to catch.
 * `frames={1}` renders it once and then leaves it alone.
 */
export default function StudioEnv({ intensity = 0.14, resolution = 128 }) {
  return (
    <Environment resolution={resolution} frames={1} environmentIntensity={intensity}>
      {/* warm key from camera-left, the same side as the room's key light */}
      <Lightformer
        form="rect" intensity={1.6} color="#ffd6a8"
        scale={[10, 6, 1]} position={[-6, 4, 2]} rotation={[0, Math.PI / 2.6, 0]}
      />
      {/* dim amber bounce from the right so the dark side isn't dead */}
      <Lightformer
        form="rect" intensity={0.45} color="#a9713f"
        scale={[10, 6, 1]} position={[6, 3, 1]} rotation={[0, -Math.PI / 2.6, 0]}
      />
      {/* soft overhead wash — gives wood and brass a gentle roll-off */}
      <Lightformer
        form="rect" intensity={0.7} color="#ffe2c2"
        scale={[12, 8, 1]} position={[0, 8, 0]} rotation={[-Math.PI / 2, 0, 0]}
      />
      {/* cool rim from behind, just enough to separate edges from the wall */}
      <Lightformer
        form="rect" intensity={0.28} color="#7f8ba3"
        scale={[10, 5, 1]} position={[0, 3, -8]} rotation={[0, 0, 0]}
      />
    </Environment>
  )
}

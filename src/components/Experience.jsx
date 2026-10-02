import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents, Preload, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import ShowroomScene from '../three/ShowroomScene'
import Effects from '../three/Effects'
import { useStore } from '../store/useStore'

function LoadWatcher() {
  const { progress, active } = useProgress()
  const setLoaded = useStore((s) => s.setLoaded)
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setLoaded(true), 350)
      return () => clearTimeout(t)
    }
  }, [active, progress, setLoaded])
  return null
}

export default function Experience({ progress, pointer, quality, visible }) {
  const detailOpen = useStore((s) => s.detailId)

  return (
    <div
      className="fixed inset-0 z-0"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.1s cubic-bezier(.22,1,.36,1)',
        pointerEvents: visible && !detailOpen ? 'auto' : 'none',
      }}
    >
      <Canvas
        dpr={quality === 'high' ? [1, 1.85] : quality === 'medium' ? [1, 1.4] : [0.8, 1]}
        shadows={quality !== 'low' ? 'soft' : false}
        gl={{
          antialias: quality === 'high',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 2.4, 6.9], fov: 38, near: 0.1, far: 90 }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.AgXToneMapping
          gl.toneMappingExposure = 1.15
          gl.outputColorSpace = THREE.SRGBColorSpace
          scene.environmentIntensity = 0.2
          if (import.meta.env.DEV) { window.__scene = scene; window.__THREE = THREE }
        }}
        frameloop={visible ? 'always' : 'demand'}
      >
        <Suspense fallback={null}>
          <ShowroomScene progress={progress} pointer={pointer} quality={quality} />
          <Preload all />
        </Suspense>
        <Effects quality={quality} dof />
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />
        <LoadWatcher />
      </Canvas>
    </div>
  )
}

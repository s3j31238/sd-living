import React, { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import StudioEnv from './StudioEnv'
import { WHY } from '../data/products'
import { WHY_ICONS } from '../components/Brand'
import { makeGlowSprite } from './textures'

const POS = [
  [-4.2, 0.9, 0],
  [-1.4, -0.35, 0.6],
  [1.4, 0.55, -0.4],
  [4.2, -0.6, 0.3],
]

function GoldRing({ index, item, pointer }) {
  const grp = useRef()
  const ring = useRef()
  const Icon = WHY_ICONS[item.id] || WHY_ICONS.art

  const goldMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: '#c9a227', roughness: 0.16, metalness: 1,
      clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 2.2,
    }),
    []
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (grp.current) {
      // parallax toward the cursor, each element at its own depth
      const depth = 0.25 + index * 0.1
      grp.current.position.x = POS[index][0] + pointer.current.x * depth * 0.9
      grp.current.position.y = POS[index][1] + pointer.current.y * depth * 0.5 + Math.sin(t * 0.5 + index * 1.4) * 0.12
    }
    if (ring.current) {
      ring.current.rotation.y = t * 0.28 + index
      ring.current.rotation.x = Math.sin(t * 0.34 + index) * 0.22
    }
  })

  return (
    <group ref={grp} position={POS[index]}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.5} floatingRange={[-0.08, 0.08]}>
        <group ref={ring}>
          <mesh material={goldMat}>
            <torusGeometry args={[0.92, 0.022, 14, 90]} />
          </mesh>
          <mesh material={goldMat} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.92, 0.012, 10, 72]} />
          </mesh>
          <mesh material={goldMat} scale={0.72} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.92, 0.009, 10, 72]} />
          </mesh>
        </group>

        <sprite scale={[3.4, 3.4, 1]} position={[0, 0, -0.5]}>
          <spriteMaterial map={makeGlowSprite()} transparent opacity={0.3} depthWrite={false}
            blending={THREE.AdditiveBlending} color="#c9a227" />
        </sprite>

        <Html center distanceFactor={7.5} zIndexRange={[10, 0]} style={{ pointerEvents: 'none', width: 220 }}>
          <div className="flex flex-col items-center text-center">
            <Icon width={34} height={34} />
            <p className="mt-3 font-sans text-[9px] uppercase text-champagne"
              style={{ letterSpacing: '.26em' }}>{item.title}</p>
            <p className="mt-2 max-w-[190px] font-sans text-[8.5px] font-light leading-[1.85] text-cream/45">
              {item.desc}
            </p>
          </div>
        </Html>
      </Float>
    </group>
  )
}

export default function WhyScene({ pointer, quality = 'high' }) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.6] : [1, 1.2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 8.2], fov: 42 }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.AgXToneMapping; gl.toneMappingExposure = 1.3 }}
    >
      <ambientLight intensity={0.5} color="#ffe6bd" />
      <pointLight position={[4, 4, 6]} intensity={22} color="#ffd9a0" distance={26} decay={2} />
      <pointLight position={[-5, -2, 4]} intensity={14} color="#e6c98a" distance={22} decay={2} />
      <Suspense fallback={null}>
        <StudioEnv intensity={0.5} />
      </Suspense>
      {WHY.map((item, i) => (
        <GoldRing key={item.id} index={i} item={item} pointer={pointer} />
      ))}
    </Canvas>
  )
}

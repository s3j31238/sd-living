import React, { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import StudioEnv from './StudioEnv'
import Lamp from './Lamp'
import Effects from './Effects'
import { makeWoodTexture, makeGlowSprite } from './textures'
import { getProduct } from '../data/products'

const ease = (t) => t * t * (3 - 2 * t)
const clamp01 = (v) => Math.min(Math.max(v, 0), 1)

function Ribbon({ w, d, h, color = '#c9a227' }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.95, envMapIntensity: 1.4 }),
    [color]
  )
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow material={mat}>
        <boxGeometry args={[w * 1.006, h * 1.004, d * 0.15]} />
      </mesh>
      <mesh position={[0, h / 2, 0]} castShadow material={mat}>
        <boxGeometry args={[w * 0.15, h * 1.004, d * 1.006]} />
      </mesh>
    </group>
  )
}

function Bow({ scale = 1, color = '#c9a227' }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.95, envMapIntensity: 1.6 }),
    [color]
  )
  return (
    <group scale={scale}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.2, 0.03, 0]} rotation={[Math.PI / 2, 0, s * 0.5]} castShadow material={mat}>
          <torusGeometry args={[0.17, 0.045, 10, 26]} />
        </mesh>
      ))}
      <mesh castShadow material={mat}>
        <sphereGeometry args={[0.07, 18, 14]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`t${s}`} position={[s * 0.17, -0.16, 0.02]} rotation={[0, 0, s * 0.45]} castShadow material={mat}>
          <boxGeometry args={[0.07, 0.3, 0.02]} />
        </mesh>
      ))}
    </group>
  )
}

function GiftBox({ progress, quality }) {
  const lid = useRef()
  const glow = useRef()
  const lampGrp = useRef()
  const shaft = useRef()
  const inner = useRef()
  const product = useMemo(() => getProduct('tinyfeet'), [])

  const W = 2.1, D = 1.45, H = 0.88
  const woodTex = useMemo(() => makeWoodTexture('#241a13'), [])
  const boxMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      map: woodTex, color: '#221e1b', roughness: 0.52, metalness: 0.12,
      clearcoat: 0.45, clearcoatRoughness: 0.45, envMapIntensity: 0.45,
    }),
    [woodTex]
  )
  const innerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a0f08', roughness: 0.92, side: THREE.BackSide }),
    []
  )

  useFrame((state, dt) => {
    const p = progress.current
    const open = ease(clamp01((p - 0.16) / 0.46))     // lid lifts
    const rise = ease(clamp01((p - 0.34) / 0.44))     // lamp emerges
    const light = ease(clamp01((p - 0.4) / 0.4))      // glow builds
    const t = state.clock.elapsedTime

    if (lid.current) {
      lid.current.position.y = H + 0.06 + open * 0.95
      lid.current.rotation.z = open * 0.2
      lid.current.rotation.x = -open * 0.1
      lid.current.position.x = open * 0.22
      lid.current.position.y += Math.sin(t * 0.7) * 0.025 * open
    }
    if (lampGrp.current) {
      lampGrp.current.position.y = 0.1 + rise * 0.5
      lampGrp.current.rotation.y = t * 0.2
      lampGrp.current.scale.setScalar(0.38 + rise * 0.2)
      lampGrp.current.visible = rise > 0.01
    }
    if (glow.current) {
      glow.current.material.opacity = light * 0.5
      const s = 1 + light * 0.35 + Math.sin(t * 1.1) * 0.03
      glow.current.scale.set(3.4 * s, 3.6 * s, 1)
    }
    if (shaft.current) {
      shaft.current.material.opacity = open * light * 0.04
      shaft.current.scale.y = 0.4 + open * 1.6
    }
    if (inner.current) inner.current.visible = open > 0.03
  })

  return (
    <group position={[0, 0, 0]}>
      {/* base */}
      <RoundedBox args={[W, H, D]} radius={0.035} smoothness={5} position={[0, H / 2, 0]} castShadow receiveShadow material={boxMat} />
      <mesh ref={inner} position={[0, H / 2 + 0.02, 0]} material={innerMat}>
        <boxGeometry args={[W * 0.93, H * 0.96, D * 0.9]} />
      </mesh>
      <Ribbon w={W} d={D} h={H} />

      {/* the piece inside */}
      <group ref={lampGrp} position={[0, 0.16, 0]}>
        <Suspense fallback={null}>
          <Lamp design={product.design} on brightness={0.78} temp={0.1} lightScale={0.55} quality={quality} shadows={quality === 'high'} />
        </Suspense>
      </group>

      {/* light shaft escaping the box */}
      <mesh ref={shaft} position={[0, H + 0.9, 0]}>
        <cylinderGeometry args={[W * 0.42, W * 0.26, 1.8, 28, 1, true]} />
        <meshBasicMaterial color="#ffb367" transparent opacity={0} side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <sprite ref={glow} position={[0, H + 0.55, -0.1]} scale={[3.4, 3.6, 1]}>
        <spriteMaterial map={makeGlowSprite()} transparent depthWrite={false}
          blending={THREE.AdditiveBlending} opacity={0} color="#ffb367" />
      </sprite>

      {/* lid */}
      <group ref={lid} position={[0, H + 0.06, 0]}>
        <RoundedBox args={[W * 1.05, 0.26, D * 1.05]} radius={0.03} smoothness={5} castShadow material={boxMat} />
        <Ribbon w={W * 1.05} d={D * 1.05} h={0.26} />
        <group position={[0, 0.26, 0]}>
          <Bow scale={0.95} />
        </group>
      </group>
    </group>
  )
}

function GiftLights({ progress }) {
  const key = useRef()
  const rim = useRef()
  useFrame((_, dt) => {
    const p = progress.current
    const k = 1 - Math.pow(0.02, Math.min(dt, 0.1))
    if (key.current) key.current.intensity = THREE.MathUtils.lerp(key.current.intensity, 0.5 + p * 0.5, k)
    if (rim.current) rim.current.intensity = THREE.MathUtils.lerp(rim.current.intensity, 1.4 + p * 1.6, k)
  })
  return (
    <>
      <ambientLight intensity={0.12} color="#ffd9ad" />
      <spotLight ref={key} position={[3.5, 6, 4]} angle={0.7} penumbra={1} intensity={0.5}
        color="#ffcf9e" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.002} />
      <spotLight ref={rim} position={[-5, 3.2, -2.5]} angle={0.9} penumbra={1} intensity={1.4}
        color="#e6c98a" distance={20} decay={2} />
      <pointLight position={[0, 1.6, 2.6]} intensity={0.35} color="#ff9c3f" distance={8} decay={2} />
    </>
  )
}

function Camera({ progress }) {
  const ref = useRef()
  useFrame((state) => {
    const p = progress.current
    const cam = state.camera
    const t = state.clock.elapsedTime
    const z = THREE.MathUtils.lerp(7.4, 6.1, ease(clamp01(p * 1.1)))
    const y = THREE.MathUtils.lerp(1.7, 2.5, ease(clamp01((p - 0.1) / 0.7)))
    cam.position.set(Math.sin(t * 0.06) * 0.55, y + Math.sin(t * 0.3) * 0.03, z)
    cam.lookAt(0, THREE.MathUtils.lerp(0.35, 0.72, ease(clamp01(p))), 0)
  })
  return null
}

export default function GiftScene({ progress, quality = 'high' }) {
  return (
    <Canvas
      dpr={quality === 'high' ? [1, 1.7] : [1, 1.25]}
      shadows={quality !== 'low' ? 'soft' : false}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.7, 7.4], fov: 38, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping
        gl.toneMappingExposure = 1.18
      }}
    >
      <Suspense fallback={null}>
        <StudioEnv intensity={0.15} />
      </Suspense>
      <GiftLights progress={progress} />
      <Camera progress={progress} />
      <GiftBox progress={progress} quality={quality} />
      {quality !== 'low' && (
        <ContactShadows position={[0, 0.002, 0]} scale={11} blur={2.6} opacity={0.75} far={3} resolution={512} />
      )}
      <Effects quality={quality === 'high' ? 'medium' : quality} dof={false} />
    </Canvas>
  )
}

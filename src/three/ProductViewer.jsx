import React, { Suspense, useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import StudioEnv from './StudioEnv'
import Lamp from './Lamp'
import Effects from './Effects'
import { makeWoodTexture } from './textures'

// ── A compact room shell the lamp actually lights ──
function ViewerRoom({ room, darkRoom, quality }) {
  const wallRef = useRef()
  const floorRef = useRef()
  const accentRef = useRef()
  const ambRef = useRef()
  const fillRef = useRef()

  const wallTarget = useMemo(() => new THREE.Color(room.wall), [room.wall])
  const floorTarget = useMemo(() => new THREE.Color(room.floor), [room.floor])
  const accentTarget = useMemo(() => new THREE.Color(room.accent), [room.accent])

  const woodTex = useMemo(() => {
    const t = makeWoodTexture('#42301f')
    t.repeat.set(2.4, 1)
    return t
  }, [])
  const tableMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.38, metalness: 0.1, envMapIntensity: 0.7 }),
    [woodTex]
  )

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.006, Math.min(dt, 0.1))
    const dim = darkRoom ? 0.12 : 1
    if (wallRef.current) wallRef.current.color.lerp(wallTarget.clone().multiplyScalar(dim), k)
    if (floorRef.current) floorRef.current.color.lerp(floorTarget.clone().multiplyScalar(dim), k)
    if (accentRef.current)
      accentRef.current.intensity = THREE.MathUtils.lerp(accentRef.current.intensity, darkRoom ? 0.04 : room.ambient * 1.6, k)
    if (ambRef.current)
      ambRef.current.intensity = THREE.MathUtils.lerp(ambRef.current.intensity, darkRoom ? 0.012 : room.ambient * 0.34, k)
    if (fillRef.current)
      fillRef.current.intensity = THREE.MathUtils.lerp(fillRef.current.intensity, darkRoom ? 0.02 : room.ambient * 0.9, k)
  })

  return (
    <group>
      <ambientLight ref={ambRef} intensity={0.1} color="#ffdcb4" />
      <spotLight ref={fillRef} position={[-4, 4.5, 3.5]} angle={0.85} penumbra={1} intensity={0.3}
        color="#e6c98a" distance={18} decay={2} />
      <pointLight ref={accentRef} position={[3.4, 1.8, -2.6]} intensity={0.3} color={room.accent} distance={11} decay={2} />

      {/* back wall */}
      <mesh position={[0, 2.2, -2.6]} receiveShadow>
        <planeGeometry args={[18, 11]} />
        <meshStandardMaterial ref={wallRef} color={room.wall} roughness={0.95} />
      </mesh>
      {/* side wall */}
      <mesh position={[-5.2, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12, 11]} />
        <meshStandardMaterial color="#0b0a09" roughness={0.98} />
      </mesh>

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial blur={[300, 90]} resolution={512} mixBlur={1} mixStrength={18}
            roughness={0.85} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.3}
            color={room.floor} metalness={0.5} mirror={0} />
        ) : (
          <meshStandardMaterial ref={floorRef} color={room.floor} roughness={0.6} metalness={0.35} />
        )}
      </mesh>

      {/* the console the lamp sits on */}
      <RoundedBox args={[4.6, 0.11, 1.9]} radius={0.02} smoothness={4} position={[0, 1.1, 0]}
        castShadow receiveShadow material={tableMat} />
      {[[-2.0, -0.72], [2.0, -0.72], [-2.0, 0.72], [2.0, 0.72]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.55, z]} castShadow>
          <cylinderGeometry args={[0.026, 0.034, 1.1, 10]} />
          <meshStandardMaterial color="#17130f" roughness={0.32} metalness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/** Slow cinematic dolly used when the viewer is embedded in a page section. */
function CinematicRig({ radius = 4.6, height = 2.3, speed = 0.06 }) {
  const { camera } = useThree()
  const tgt = useMemo(() => new THREE.Vector3(0, 1.95, 0), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    const a = Math.sin(t) * 0.55 - 0.18
    const r = radius + Math.sin(t * 0.7) * 0.35
    camera.position.set(Math.sin(a) * r, height + Math.sin(t * 1.3) * 0.12, Math.cos(a) * r)
    camera.lookAt(tgt)
  })
  return null
}

function ViewerRig({ autoRotate, zoom, controlsRef }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 2.05, 4.3)
  }, [camera])

  useFrame((_, dt) => {
    const c = controlsRef.current
    if (!c) return
    const want = THREE.MathUtils.clamp(4.3 / zoom, 1.9, 8)
    const dir = new THREE.Vector3().subVectors(camera.position, c.target)
    const len = dir.length()
    if (Math.abs(len - want) > 0.01) {
      dir.setLength(THREE.MathUtils.lerp(len, want, 1 - Math.pow(0.008, Math.min(dt, 0.1))))
      camera.position.copy(c.target).add(dir)
    }
  })
  return null
}

function LampStage({ product, on, brightness, temp, quality, spin }) {
  const g = useRef()
  useFrame((state, dt) => {
    if (!g.current) return
    // gentle float so the piece never feels like a static render
    g.current.position.y = 1.155 + Math.sin(state.clock.elapsedTime * 0.6) * 0.008
  })
  return (
    <group ref={g} position={[0, 1.155, 0]}>
      <Suspense fallback={null}>
        <Lamp
          design={product.design}
          on={on}
          brightness={brightness}
          temp={temp}
          quality={quality}
          shadows
        />
      </Suspense>
    </group>
  )
}

export default function ProductViewer({
  product, on, brightness, temp, room, darkRoom, autoRotate, zoom, quality,
  interactive = true, cinematic = false, dpr, frameloop = 'always', camRadius, camHeight,
}) {
  const controls = useRef()

  return (
    <Canvas
      dpr={dpr || (quality === 'high' ? [1, 1.8] : [1, 1.35])}
      frameloop={frameloop}
      shadows={quality !== 'low' ? 'soft' : false}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [0, 2.05, 4.3], fov: 36, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.AgXToneMapping
        gl.toneMappingExposure = 1.2
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <color attach="background" args={[darkRoom ? '#030303' : '#080706']} />
      <fog attach="fog" args={[darkRoom ? '#030303' : '#0a0807', 6, 20]} />

      <Suspense fallback={null}>
        <StudioEnv intensity={darkRoom ? 0.02 : 0.14} />
      </Suspense>

      <ViewerRoom room={room} darkRoom={darkRoom} quality={quality} />
      <LampStage product={product} on={on} brightness={brightness} temp={temp} quality={quality} />

      {quality !== 'low' && (
        <ContactShadows position={[0, 1.163, 0]} scale={5} blur={2.4} opacity={0.62} far={1.6} resolution={512} />
      )}

      {!interactive && <CinematicRig radius={camRadius} height={camHeight} />}

      {interactive && <OrbitControls
        ref={controls}
        target={[0, 1.95, 0]}
        enablePan
        enableZoom
        enableDamping
        dampingFactor={0.055}
        rotateSpeed={0.7}
        panSpeed={0.6}
        zoomSpeed={0.8}
        minDistance={1.9}
        maxDistance={8}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 + 0.12}
        autoRotate={autoRotate}
        autoRotateSpeed={1.1}
        makeDefault
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />}
      {interactive && <ViewerRig autoRotate={autoRotate} zoom={zoom} controlsRef={controls} />}

      <Effects quality={quality} dof={false} />
    </Canvas>
  )
}

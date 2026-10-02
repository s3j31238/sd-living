import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, RoundedBox } from '@react-three/drei'
import { makeWoodTexture } from './textures'

// ── Vertical walnut slat paneling on the back wall ──
function Slats({ count = 34, width = 26, y = 3.2, z = -7.4, color = '#2a1e16' }) {
  const ref = useRef()
  const tex = useMemo(() => makeWoodTexture(color), [color])
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.72, metalness: 0.04 }),
    [tex]
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const setup = (mesh) => {
    if (!mesh) return
    ref.current = mesh
    const step = width / count
    for (let i = 0; i < count; i++) {
      dummy.position.set(-width / 2 + step * i + step / 2, y, z)
      const d = 0.1 + ((i * 37) % 7) * 0.012
      dummy.scale.set(1, 1, d / 0.14)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  return (
    <instancedMesh ref={setup} args={[null, null, count]} castShadow receiveShadow material={mat}>
      <boxGeometry args={[width / count - 0.055, 7.4, 0.14]} />
    </instancedMesh>
  )
}

// ── Floating dust in the light beam ──
function Dust({ count = 150, radius = 9, quality = 'high' }) {
  const ref = useRef()
  const n = quality === 'low' ? 0 : quality === 'medium' ? Math.floor(count * 0.5) : count

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(n * 3)
    const speeds = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (Math.random() - 0.5) * radius * 2
      positions[i * 3 + 1] = Math.random() * 5.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 1.4 - 1
      speeds[i] = 0.02 + Math.random() * 0.06
    }
    return { positions, speeds }
  }, [n, radius])

  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,225,180,1)')
    g.addColorStop(0.4, 'rgba(255,200,130,0.35)')
    g.addColorStop(1, 'rgba(255,190,120,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state) => {
    if (!ref.current || !n) return
    const arr = ref.current.geometry.attributes.position.array
    const t = state.clock.elapsedTime
    for (let i = 0; i < n; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.016
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0008
      if (arr[i * 3 + 1] > 5.6) arr[i * 3 + 1] = -0.2
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  if (!n) return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={n} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        map={tex}
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// ── The walnut console table ──
export function Table({ position = [0, 0, 0], width = 5.2, depth = 2.1, height = 1.15, color = '#3b2a1d' }) {
  const tex = useMemo(() => makeWoodTexture(color), [color])
  const mat = useMemo(() => {
    tex.repeat.set(3, 1)
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.08, envMapIntensity: 0.8 })
  }, [tex])
  const legMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#181410', roughness: 0.3, metalness: 0.85 }),
    []
  )

  return (
    <group position={position}>
      <RoundedBox
        args={[width, 0.12, depth]}
        radius={0.025}
        smoothness={4}
        position={[0, height, 0]}
        castShadow
        receiveShadow
        material={mat}
      />
      {/* apron */}
      <mesh position={[0, height - 0.12, -depth * 0.32]} castShadow material={mat}>
        <boxGeometry args={[width * 0.9, 0.12, 0.06]} />
      </mesh>
      {[
        [-width / 2 + 0.22, -depth / 2 + 0.22],
        [width / 2 - 0.22, -depth / 2 + 0.22],
        [-width / 2 + 0.22, depth / 2 - 0.22],
        [width / 2 - 0.22, depth / 2 - 0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, height / 2, z]} castShadow material={legMat}>
          <cylinderGeometry args={[0.028, 0.038, height, 12]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * The luxury showroom shell. `warmth` (0–1) drives how much the
 * walls/floor pick up the lamp light — used for the scroll reveal.
 */
export default function Room({ quality = 'high', warmth = 1, wall = '#2b211a', floor = '#14100d' }) {
  const wallMat = useRef()
  const ambRef = useRef()
  const wallColor = useMemo(() => new THREE.Color(wall), [wall])
  const dark = useMemo(() => new THREE.Color('#0a0807'), [])

  useFrame(() => {
    if (wallMat.current) {
      wallMat.current.color.copy(dark).lerp(wallColor, THREE.MathUtils.clamp(warmth, 0, 1))
    }
  })

  const hi = quality === 'high'

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[46, 46]} />
        {hi ? (
          <MeshReflectorMaterial
            blur={[420, 110]}
            resolution={512}
            mixBlur={1.1}
            mixStrength={26}
            roughness={0.82}
            depthScale={1.15}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.35}
            color={floor}
            metalness={0.55}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial color={floor} roughness={0.55} metalness={0.4} />
        )}
      </mesh>

      {/* back wall */}
      <mesh position={[0, 3.6, -7.6]} receiveShadow>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial ref={wallMat} color={wall} roughness={0.94} metalness={0} />
      </mesh>

      {/* side walls */}
      <mesh position={[-18.5, 3.6, -1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[26, 14]} />
        <meshStandardMaterial color="#18120d" roughness={0.96} />
      </mesh>
      <mesh position={[18.5, 3.6, -1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[26, 14]} />
        <meshStandardMaterial color="#18120d" roughness={0.96} />
      </mesh>

      {/* ceiling */}
      <mesh position={[0, 8.2, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 26]} />
        <meshStandardMaterial color="#070606" roughness={1} />
      </mesh>

      {hi && <Slats />}

      <Dust quality={quality} />
    </group>
  )
}

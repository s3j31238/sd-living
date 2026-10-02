import React, { useMemo, useRef, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import { makeWoodTexture, makeTextPanel, makeGlowSprite, tempColor, coolColor } from './textures'

// ─────────────────────────────────────────────────────────────
//  A real SD LIVING lamp, rebuilt from the brand reference:
//
//  'silhouette'  laser-cut black line-art acrylic standing in a
//                solid walnut base, edge-lit warm amber.
//  'cylinder'    matte-black cylinder with the motif cut out,
//                lit from within (cool or warm).
//  'text'        engraved quote plate — letters glow through black.
//  'penstand'    unlit black silhouette desk object + pen.
// ─────────────────────────────────────────────────────────────

const ART = (name, kind) => `/art/${name}_${kind}.png`

function useAspect(tex) {
  return useMemo(() => {
    const img = tex?.image
    if (!img || !img.width) return 1
    return img.width / img.height
  }, [tex])
}

// ── Walnut base ─────────────────────────────────
function WoodBase({ width = 2.1, depth = 0.62, height = 0.3, color = '#4a3323', style = 'slab' }) {
  const tex = useMemo(() => makeWoodTexture(color), [color])
  const mat = useMemo(() => {
    const t = tex.clone()
    t.needsUpdate = true
    t.repeat.set(2.2, 0.8)
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.46, metalness: 0.06, envMapIntensity: 0.9 })
  }, [tex])

  if (style === 'disc') {
    return (
      <mesh castShadow receiveShadow position={[0, height / 2, 0]} material={mat}>
        <cylinderGeometry args={[width * 0.34, width * 0.36, height, 64]} />
      </mesh>
    )
  }
  if (style === 'step') {
    return (
      <group>
        <RoundedBox args={[width, height * 0.5, depth]} radius={0.018} smoothness={4}
          position={[0, height * 0.25, 0]} castShadow receiveShadow material={mat} />
        <RoundedBox args={[width * 0.78, height * 0.55, depth * 0.8]} radius={0.018} smoothness={4}
          position={[0, height * 0.72, 0]} castShadow receiveShadow material={mat} />
      </group>
    )
  }
  return (
    <RoundedBox args={[width, height, depth]} radius={0.022} smoothness={5}
      position={[0, height / 2, 0]} castShadow receiveShadow material={mat} />
  )
}

// ── Black matte plate material (art or text) ────
function usePlateMaterial(tex, glowHex, quality) {
  return useMemo(() => {
    const t = tex
    if (t) {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
    }
    return new THREE.MeshPhysicalMaterial({
      map: t,
      color: '#0b0a09',
      emissive: new THREE.Color(glowHex),
      emissiveMap: t,
      emissiveIntensity: 1,
      alphaTest: 0.42,
      transparent: false,
      roughness: 0.52,
      metalness: 0,
      envMapIntensity: 0.35,
      clearcoat: quality === 'high' ? 0.35 : 0,
      clearcoatRoughness: 0.4,
      side: THREE.FrontSide,
    })
  }, [tex, glowHex, quality])
}

// ── Silhouette / text lamp ──────────────────────
function PlateLamp({ design, quality, matRef, lightRef, spillRef, haloRef, shadows }) {
  const isText = design.type === 'text'
  const artTex = useTexture(isText ? ART('floral', 'panel') : ART(design.art, 'panel'))
  const textTex = useMemo(
    () => (isText ? makeTextPanel({ ...design.textPanel, key: design.art || 'txt' }) : null),
    [isText, design]
  )
  const tex = isText ? textTex : artTex
  const aspect = useAspect(tex)

  const h = design.plateHeight ?? 1.65
  const w = h * aspect
  const baseW = Math.max(w * 0.86, 1.0)
  const baseH = 0.3
  const mat = usePlateMaterial(tex, design.glow, quality)

  useLayoutEffect(() => {
    matRef.current = mat
  }, [mat, matRef])

  const y = baseH + h / 2 - 0.04

  return (
    <group>
      <WoodBase width={baseW} depth={0.62} height={baseH} color={design.wood} style={design.baseStyle} />

      {/* the laser-cut acrylic plate — cut clean through, so it reads
          correctly from the front AND the back */}
      <mesh position={[0, y, 0.004]} castShadow={shadows} receiveShadow={false}>
        <planeGeometry args={[w, h]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, y, -0.004]} rotation={[0, Math.PI, 0]} castShadow={false}>
        <planeGeometry args={[w, h]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* warm LED channel inside the base */}
      <mesh position={[0, baseH + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[baseW * 0.72, 0.1]} />
        <meshBasicMaterial color={design.glow} transparent opacity={0.55}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Halo must be a PLANE, not a sprite. A sprite is a billboard that
          pivots about its centre, so once the camera moves off-axis its
          near edge swings in FRONT of the plate and the additive quad
          clips against it — that painted a hard vertical seam straight
          down the artwork. A plane parallel to the plate can't intersect it. */}
      <mesh ref={haloRef} position={[0, y, -0.07]}>
        <planeGeometry args={[w * 2.2, h * 2.0]} />
        <meshBasicMaterial map={makeGlowSprite()} transparent depthWrite={false}
          side={THREE.DoubleSide} blending={THREE.AdditiveBlending} opacity={0} />
      </mesh>

      {/* emitter — washes the wall behind and the table below */}
      {/* No castShadow here on purpose: a point light sitting 12cm from a
          large plane fills its shadow cube, and the cube-face seams project
          as hard vertical bands across the wall. The plate's silhouette is
          read from the key light + ContactShadows instead. */}
      <pointLight ref={lightRef} position={[0, y, -0.14]} distance={11} decay={2} />
      <pointLight ref={spillRef} position={[0, baseH + 0.16, 0.3]} distance={3.4} decay={2} />
    </group>
  )
}

// ── Cylinder lamp ───────────────────────────────
function CylinderLamp({ design, quality, matRef, lightRef, spillRef, haloRef, shadows }) {
  const tex = useTexture(ART(design.art, 'window'))

  const H = design.plateHeight ?? 2.5
  const R = design.radius ?? 0.46

  const mat = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
    tex.anisotropy = 8
    return new THREE.MeshPhysicalMaterial({
      map: tex,
      color: '#08080a',
      emissive: new THREE.Color(design.glow),
      emissiveMap: tex,
      emissiveIntensity: 1,
      roughness: 0.68,
      metalness: 0.04,
      envMapIntensity: 0.3,
      clearcoat: quality === 'high' ? 0.25 : 0,
      clearcoatRoughness: 0.5,
      side: THREE.DoubleSide,
    })
  }, [tex, design.glow, quality])

  useLayoutEffect(() => {
    matRef.current = mat
  }, [mat, matRef])

  const capMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0b0a09', roughness: 0.42, metalness: 0.35 }),
    []
  )

  return (
    <group>
      <mesh position={[0, H / 2, 0]} rotation={[0, Math.PI, 0]} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[R, R, H, quality === 'low' ? 32 : 72, 1, true]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* rims */}
      <mesh position={[0, H - 0.015, 0]} castShadow material={capMat}>
        <cylinderGeometry args={[R * 1.035, R * 1.035, 0.07, 48]} />
      </mesh>
      <mesh position={[0, 0.035, 0]} castShadow receiveShadow material={capMat}>
        <cylinderGeometry args={[R * 1.06, R * 1.08, 0.07, 48]} />
      </mesh>
      <mesh position={[0, H - 0.05, 0]} material={capMat}>
        <cylinderGeometry args={[R * 0.99, R * 0.99, 0.02, 32]} />
      </mesh>

      <sprite ref={haloRef} position={[0, H * 0.52, 0]} scale={[R * 7, H * 1.5, 1]}>
        <spriteMaterial map={makeGlowSprite()} transparent depthWrite={false}
          blending={THREE.AdditiveBlending} opacity={0} />
      </sprite>

      <pointLight ref={lightRef} position={[0, H * 0.55, 0]} distance={12} decay={2}
        castShadow={shadows && quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
        shadow-bias={-0.0025} shadow-normalBias={0.04} />
      <pointLight ref={spillRef} position={[0, 0.2, 0]} distance={3.2} decay={2} />
    </group>
  )
}

// ── Pen stand (unlit desk object) ───────────────
function PenStand({ design, quality, matRef, lightRef, spillRef, haloRef }) {
  const tex = useTexture(ART(design.art, 'panel'))
  const aspect = useAspect(tex)
  const h = design.plateHeight ?? 1.5
  const w = h * aspect

  const mat = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    return new THREE.MeshPhysicalMaterial({
      map: tex,
      color: '#0a0a0a',
      emissive: new THREE.Color(design.glow),
      emissiveMap: tex,
      emissiveIntensity: 0,
      alphaTest: 0.42,
      roughness: 0.4,
      metalness: 0.5,
      envMapIntensity: 0.8,
      clearcoat: quality === 'high' ? 0.6 : 0,
      side: THREE.FrontSide,
    })
  }, [tex, design.glow, quality])

  useLayoutEffect(() => {
    matRef.current = mat
  }, [mat, matRef])

  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.3, metalness: 0.9 }),
    []
  )
  const penMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1a1c', roughness: 0.22, metalness: 0.95 }),
    []
  )
  const trim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: design.accent, roughness: 0.2, metalness: 1 }),
    [design.accent]
  )

  return (
    <group>
      {/* base plate */}
      <RoundedBox args={[w * 1.25, 0.075, 0.72]} radius={0.03} smoothness={4}
        position={[0, 0.037, 0]} castShadow receiveShadow material={metal} />
      <mesh position={[0, 0.078, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial color={design.accent} roughness={0.25} metalness={1} />
      </mesh>

      <mesh position={[0, 0.075 + h / 2, 0.003]} castShadow>
        <planeGeometry args={[w, h]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, 0.075 + h / 2, -0.003]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* the pen */}
      <group position={[-w * 0.42, 0, 0.02]} rotation={[0, 0, 0.06]}>
        <mesh position={[0, 0.075 + h * 0.46, 0]} castShadow material={penMat}>
          <cylinderGeometry args={[0.048, 0.055, h * 0.9, 20]} />
        </mesh>
        <mesh position={[0, 0.075 + h * 0.93, 0]} castShadow material={trim}>
          <cylinderGeometry args={[0.046, 0.046, 0.12, 20]} />
        </mesh>
        <mesh position={[0, 0.075 + h * 0.02, 0]} castShadow material={trim}>
          <coneGeometry args={[0.048, 0.14, 20]} />
        </mesh>
      </group>

      <sprite ref={haloRef} position={[0, h * 0.55, -0.05]} scale={[w * 2, h * 1.8, 1]}>
        <spriteMaterial map={makeGlowSprite()} transparent depthWrite={false}
          blending={THREE.AdditiveBlending} opacity={0} />
      </sprite>
      <pointLight ref={lightRef} position={[0, h * 0.6, 0.6]} distance={5} decay={2} intensity={0} />
      <pointLight ref={spillRef} position={[0, 0.3, 0.4]} distance={2.4} decay={2} intensity={0} />
    </group>
  )
}

const BODIES = {
  silhouette: PlateLamp,
  text: PlateLamp,
  cylinder: CylinderLamp,
  penstand: PenStand,
}

/**
 * @param on          light state
 * @param brightness  0–1
 * @param temp        0 warm 2700K … 1 neutral 4000K
 * @param hovered     boosts glow + gold rim
 */
export default function Lamp({
  design,
  on = true,
  brightness = 0.8,
  temp = 0.15,
  shadows = true,
  quality = 'high',
  lightScale = 1,
  hovered = false,
  ...props
}) {
  const matRef = useRef()
  const lightRef = useRef()
  const spillRef = useRef()
  const haloRef = useRef()
  const cur = useRef({ i: 0, e: 0 })

  const Body = BODIES[design.type] || PlateLamp
  const unlit = design.type === 'penstand'
  const cool = design.spectrum === 'cool'

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.0018, Math.min(dt, 0.1))
    const boost = hovered ? 1.4 : 1
    const wantI = unlit ? 0 : (on ? 0.3 + brightness * 2.0 : 0) * boost * lightScale
    const wantE = unlit ? (hovered ? 0.35 : 0.12) : on ? 0.45 + brightness * 2.5 : 0.05

    cur.current.i = THREE.MathUtils.lerp(cur.current.i, wantI, k)
    cur.current.e = THREE.MathUtils.lerp(cur.current.e, wantE, k)

    // imperceptible mains flicker — keeps the light feeling alive
    const t = state.clock.elapsedTime
    const flick = 1 + Math.sin(t * 2.1) * 0.011 + Math.sin(t * 7.3) * 0.005

    const col = cool ? coolColor(temp) : tempColor(temp)

    if (lightRef.current) {
      lightRef.current.intensity = cur.current.i * 8 * flick
      lightRef.current.color.copy(col)
    }
    if (spillRef.current) {
      spillRef.current.intensity = cur.current.i * 2.2 * flick
      spillRef.current.color.copy(col)
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = cur.current.e * flick
      matRef.current.emissive.copy(col).lerp(new THREE.Color(design.glow), cool ? 0.25 : 0.5)
    }
    if (haloRef.current) {
      haloRef.current.material.opacity = Math.min(Math.max(cur.current.e - 0.12, 0) * 0.26, 0.7)
      haloRef.current.material.color.copy(col)
    }
  })

  return (
    <group {...props}>
      <Body
        design={design}
        quality={quality}
        shadows={shadows}
        matRef={matRef}
        lightRef={lightRef}
        spillRef={spillRef}
        haloRef={haloRef}
      />
    </group>
  )
}

export function preloadLampArt(designs) {
  designs.forEach((d) => {
    if (d.type === 'cylinder') useTexture.preload(ART(d.art, 'window'))
    else if (d.art) useTexture.preload(ART(d.art, 'panel'))
  })
}

import React, { useRef, useMemo, Suspense, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, ContactShadows } from '@react-three/drei'
import StudioEnv from './StudioEnv'
import Lamp from './Lamp'
import Room, { Table } from './Room'
import { useStore } from '../store/useStore'
import { FEATURED, inr } from '../data/products'

const TABLE_TOP = 1.21

// ── Composition: wide screens get the lamp off-centre beside the
//    headline; portrait screens centre it and stack the copy below. ──
const LAYOUT = {
  landscape: {
    slots: [[-2.62, 0], [-0.87, 0], [0.87, 0], [2.62, 0]],
    table: { width: 7.8, depth: 2.5 },
    cam: [
      { p: 0.0,  pos: [1.42, 2.08, 4.45], tgt: [-0.70, 2.12, 0], fov: 41 },
      { p: 0.14, pos: [1.00, 2.04, 3.55], tgt: [-0.30, 2.08, 0], fov: 39 },
      { p: 0.30, pos: [0.16, 2.06, 2.55], tgt: [0, 2.10, 0],     fov: 34 },
      { p: 0.45, pos: [-1.95, 2.05, 2.15],tgt: [0, 2.05, 0],     fov: 36 },
      { p: 0.58, pos: [-2.70, 2.55, -1.25],tgt: [0, 2.00, 0],    fov: 38 },
      { p: 0.70, pos: [-0.85, 2.95, 3.55],tgt: [0, 2.00, 0],     fov: 42 },
      { p: 0.84, pos: [0, 2.72, 6.75],    tgt: [0, 1.95, 0],     fov: 46 },
      { p: 1.0,  pos: [0, 2.52, 7.10],    tgt: [0, 1.90, 0],     fov: 46 },
    ],
  },
  portrait: {
    // 2 × 2 on the table reads far better on a phone than a wide row
    slots: [[-1.28, 0.78], [1.28, 0.78], [-1.28, -0.82], [1.28, -0.82]],
    table: { width: 5.2, depth: 3.0 },
    cam: [
      { p: 0.0,  pos: [0, 2.30, 3.75], tgt: [0, 2.16, 0],  fov: 48 },
      { p: 0.14, pos: [0, 2.20, 3.15], tgt: [0, 2.12, 0],  fov: 46 },
      { p: 0.30, pos: [0.1, 2.12, 2.45],tgt: [0, 2.10, 0], fov: 42 },
      { p: 0.45, pos: [-1.75, 2.10, 2.0],tgt: [0, 2.05, 0],fov: 44 },
      { p: 0.58, pos: [-2.30, 2.60, -1.3],tgt: [0, 2.0, 0],fov: 46 },
      { p: 0.70, pos: [-0.7, 3.20, 3.3],tgt: [0, 1.95, 0], fov: 50 },
      { p: 0.84, pos: [0, 4.05, 5.3],   tgt: [0, 1.62, 0], fov: 54 },
      { p: 1.0,  pos: [0, 3.95, 5.6],   tgt: [0, 1.58, 0], fov: 54 },
    ],
  },
}

const smoothstep = (a, b, x) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

function sampleCam(CAM, p) {
  let i = 0
  while (i < CAM.length - 2 && p > CAM[i + 1].p) i++
  const a = CAM[i]
  const b = CAM[i + 1]
  const t = smoothstep(a.p, b.p, p)
  const L = THREE.MathUtils.lerp
  return {
    pos: [L(a.pos[0], b.pos[0], t), L(a.pos[1], b.pos[1], t), L(a.pos[2], b.pos[2], t)],
    tgt: [L(a.tgt[0], b.tgt[0], t), L(a.tgt[1], b.tgt[1], t), L(a.tgt[2], b.tgt[2], t)],
    fov: L(a.fov, b.fov, t),
  }
}

function useLayout() {
  const { size } = useThree()
  return useMemo(
    () => (size.width < size.height * 1.02 ? LAYOUT.portrait : LAYOUT.landscape),
    [size.width, size.height]
  )
}

// ── Floating glass label over a hovered piece ───
function LampLabel({ product, visible, onOpen, onAdd }) {
  return (
    <Html
      position={[0, 2.5, 0]}
      center
      distanceFactor={6}
      zIndexRange={[20, 0]}
      style={{
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 14}px)`,
        transition: 'opacity .5s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)',
        width: 250,
      }}
    >
      <div className="glass-strong px-5 py-4 text-center select-none">
        <div className="eyebrow mb-2 !text-[8px]">{product.category}</div>
        <div className="mb-1.5 font-display text-[18px] leading-tight text-cream">{product.short}</div>
        <div className="mb-2.5 flex items-center justify-center gap-2">
          <span className="text-[13px] tracking-widest text-champagne">{inr(product.price)}</span>
          <span className="text-[11px] text-cream/30 line-through">{inr(product.mrp)}</span>
        </div>
        <div className="mb-3 text-[10px] tracking-[0.2em] text-champagne/80">
          {'★'.repeat(Math.round(product.rating))}
          <span className="ml-1.5 text-cream/35">({product.reviews})</span>
        </div>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onAdd(e) }}
            className="btn-gold flex-1 !px-2 !py-2.5 !text-[9px]">ADD TO CART</button>
          <button onClick={(e) => { e.stopPropagation(); onOpen() }}
            className="btn-ghost !px-3 !py-2.5 !text-[9px]">VIEW</button>
        </div>
      </div>
    </Html>
  )
}

// ── One product in the showroom ─────────────────
function ShowroomLamp({ product, index, progress, intro, quality, layout, galleryReady }) {
  const grp = useRef()
  const [hovered, setHovered] = useState(false)
  const hoverId = useStore((s) => s.hoverId)
  const setHoverId = useStore((s) => s.setHoverId)
  const openDetail = useStore((s) => s.openDetail)
  const addToCart = useStore((s) => s.addToCart)
  const launchFlight = useStore((s) => s.launchFlight)
  const notify = useStore((s) => s.notify)
  const { camera, size } = useThree()

  const isHero = index === 0
  const vec = useMemo(() => new THREE.Vector3(), [])
  const [sx, sz] = layout.slots[index]

  useFrame((state, dt) => {
    const g = grp.current
    if (!g) return
    const p = progress.current
    const t = state.clock.elapsedTime
    const d = Math.min(dt, 0.1)

    const appear = isHero ? 1 : smoothstep(0.6, 0.78, p) * smoothstep(0.02, 0.2, intro.current)
    const introScale = isHero ? smoothstep(0.05, 0.55, intro.current) : 1
    // the hero piece is presented larger, then settles into the line-up
    const heroBoost = isHero ? THREE.MathUtils.lerp(1.16, 1, smoothstep(0.55, 0.85, p)) : 1
    const s = appear * introScale * heroBoost
    // `s` is already a smooth, wall-clock-driven value — assign it directly.
    // Lerping it again made the reveal frame-rate dependent (and left ghost
    // lamps hanging around for seconds on slow GPUs).
    g.scale.setScalar(s)
    g.visible = s > 0.01

    const spread = smoothstep(0.66, 0.9, p)
    const x = isHero ? THREE.MathUtils.lerp(0, sx, spread) : sx
    const z = isHero ? THREE.MathUtils.lerp(0, sz, spread) : sz
    g.position.x = THREE.MathUtils.lerp(g.position.x, x, 1 - Math.pow(0.004, d))
    g.position.z = THREE.MathUtils.lerp(g.position.z, z, 1 - Math.pow(0.004, d))
    g.position.y = TABLE_TOP + Math.sin(t * 0.55 + index * 1.7) * 0.012

    let rotY = Math.sin(t * 0.22 + index) * 0.1
    if (isHero) {
      const spin = smoothstep(0.2, 0.44, p) * Math.PI * 2
      rotY = rotY * (1 - smoothstep(0.18, 0.26, p)) + spin
    }
    if (hovered) rotY += Math.sin(t * 0.8) * 0.16 + 0.1
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, rotY, 1 - Math.pow(0.02, d))
  })

  const active = hoverId === product.id

  const handleAdd = () => {
    addToCart(product.id, 1)
    if (grp.current) {
      vec.setFromMatrixPosition(grp.current.matrixWorld)
      vec.y += 1.6
      vec.project(camera)
      launchFlight({
        x: (vec.x * 0.5 + 0.5) * size.width,
        y: (-vec.y * 0.5 + 0.5) * size.height,
        id: product.id,
      })
    }
    notify({ title: 'ADDED TO CART', body: product.short })
  }

  return (
    <group ref={grp} scale={isHero ? 0.001 : 0} position={[isHero ? 0 : sx, TABLE_TOP, isHero ? 0 : sz]}>
      <Suspense fallback={null}>
        <Lamp
          design={product.design}
          on
          brightness={isHero ? 0.55 + intro.current * 0.35 : 0.8}
          temp={product.design.spectrum === 'cool' ? 0.5 : 0.16}
          quality={quality}
          shadows={isHero || quality === 'high'}
          hovered={active}
          lightScale={isHero ? intro.current : 1}
        />
      </Suspense>

      <mesh
        position={[0, 1.25, 0]}
        visible={false}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setHoverId(product.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); setHoverId(null); document.body.style.cursor = '' }}
        onClick={(e) => { e.stopPropagation(); openDetail(product.id) }}
      >
        <boxGeometry args={[1.7, 2.7, 1.1]} />
      </mesh>

      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 40]} />
        <meshBasicMaterial color="#c9a227" transparent opacity={active ? 0.17 : 0}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <LampLabel
        product={product}
        visible={active && galleryReady}
        onOpen={() => openDetail(product.id)}
        onAdd={handleAdd}
      />
    </group>
  )
}

// ── Camera rig ──────────────────────────────────
function Rig({ progress, pointer, intro, layout }) {
  const { camera } = useThree()
  const tgt = useRef(new THREE.Vector3(0, 2.06, 0))
  const pos = useRef(new THREE.Vector3(1.3, 2.0, 3.95))
  const tmpP = useMemo(() => new THREE.Vector3(), [])
  const tmpT = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const p = progress.current
    const k = 1 - Math.pow(0.0009, Math.min(dt, 0.1))
    const c = sampleCam(layout.cam, p)

    const par = (1 - smoothstep(0.02, 0.34, p)) * 0.8 + 0.2
    const px = pointer.current.x * par
    const py = pointer.current.y * par

    tmpP.set(c.pos[0] + px * 0.62, c.pos[1] + py * 0.34, c.pos[2] + Math.abs(px) * 0.1)
    tmpT.set(c.tgt[0] + px * 0.16, c.tgt[1] + py * 0.08, c.tgt[2])
    pos.current.lerp(tmpP, k)
    tgt.current.lerp(tmpT, k)

    const t = state.clock.elapsedTime
    camera.position.copy(pos.current)
    camera.position.y += Math.sin(t * 0.34) * 0.018
    camera.position.x += Math.sin(t * 0.21) * 0.013
    camera.lookAt(tgt.current)

    const wantFov = c.fov + (1 - intro.current) * 8
    if (Math.abs(camera.fov - wantFov) > 0.01) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, wantFov, k)
      camera.updateProjectionMatrix()
    }
  })
  return null
}

// ── Architectural lighting ──────────────────────
function Lighting({ progress, intro, quality }) {
  const amb = useRef()
  const key = useRef()
  const rim = useRef()
  const accent = useRef()

  useFrame((_, dt) => {
    const p = progress.current
    const warm = smoothstep(0.0, 0.25, intro.current)
    const showroom = smoothstep(0.55, 0.85, p)
    const k = 1 - Math.pow(0.01, Math.min(dt, 0.1))
    const L = THREE.MathUtils.lerp
    if (amb.current) amb.current.intensity = L(amb.current.intensity, 0.04 + warm * 0.1 + showroom * 0.16, k)
    if (key.current) key.current.intensity = L(key.current.intensity, warm * (0.2 + showroom * 0.45), k)
    if (rim.current) rim.current.intensity = L(rim.current.intensity, warm * (0.45 + showroom * 0.65), k)
    if (accent.current) accent.current.intensity = L(accent.current.intensity, warm * (0.55 + showroom * 1.0), k)
  })

  return (
    <>
      <ambientLight ref={amb} intensity={0} color="#ffd9ad" />
      <directionalLight
        ref={key} position={[3.5, 7.5, 4]} intensity={0} color="#ffcf9e"
        castShadow={quality === 'high'}
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={1} shadow-camera-far={26}
        shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={9} shadow-camera-bottom={-5}
        shadow-bias={-0.0016} shadow-normalBias={0.03}
      />
      <spotLight ref={rim} position={[-7, 5.2, 2.5]} angle={0.9} penumbra={1} intensity={0}
        color="#e6c98a" distance={24} decay={2} />
      <pointLight ref={accent} position={[4.2, 2.3, -5.2]} intensity={0} color="#8a2f18" distance={15} decay={2} />
    </>
  )
}

const INTRO_SECONDS = 3.2

export default function ShowroomScene({ progress, pointer, quality }) {
  const intro = useRef(0)
  const enteredAt = useRef(null)
  const entered = useStore((s) => s.entered)
  const warmth = useRef(0)
  const [roomWarmth, setRoomWarmth] = useState(0)
  const [galleryReady, setGalleryReady] = useState(false)
  const layout = useLayout()

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1)

    // wall-clock driven so the reveal always takes the same time,
    // no matter how many frames the device actually manages
    if (entered && enteredAt.current === null) enteredAt.current = performance.now()
    if (!entered) enteredAt.current = null
    intro.current = enteredAt.current === null
      ? 0
      : THREE.MathUtils.clamp((performance.now() - enteredAt.current) / (INTRO_SECONDS * 1000), 0, 1)

    const want = smoothstep(0.15, 0.85, intro.current) * (0.45 + smoothstep(0.5, 0.88, progress.current) * 0.55)
    warmth.current = THREE.MathUtils.lerp(warmth.current, want, 1 - Math.pow(0.02, d))
    if (Math.abs(warmth.current - roomWarmth) > 0.012) setRoomWarmth(warmth.current)

    const g = progress.current > 0.8
    if (g !== galleryReady) setGalleryReady(g)
  })

  return (
    <>
      <color attach="background" args={['#050403']} />
      <fog attach="fog" args={['#070505', 8, 26]} />

      <Lighting progress={progress} intro={intro} quality={quality} />
      <Rig progress={progress} pointer={pointer} intro={intro} layout={layout} />

      <Suspense fallback={null}>
        <StudioEnv intensity={0.14} />
      </Suspense>

      <Room quality={quality} warmth={roomWarmth} />
      <Table position={[0, 0, 0]} width={layout.table.width} depth={layout.table.depth} height={1.15} color="#3b2a1d" />

      {FEATURED.map((p, i) => (
        <ShowroomLamp
          key={p.id}
          product={p}
          index={i}
          progress={progress}
          intro={intro}
          quality={quality}
          layout={layout}
          galleryReady={galleryReady}
        />
      ))}

      {quality !== 'low' && (
        <ContactShadows position={[0, TABLE_TOP + 0.002, 0]} scale={10} blur={2.6} opacity={0.55} far={2} resolution={512} color="#000000" />
      )}
    </>
  )
}

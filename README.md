# SD LIVING — Light Up Your Space

A cinematic, 3D-first ecommerce experience for the SD LIVING luxury lighting brand.
Built with React 19, Three.js, React Three Fiber, Drei, GSAP, Framer Motion and Tailwind CSS.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview
```

Requires Node 18+. There are no API keys, no backend and no external CDN calls at
runtime — every texture, material and environment map is generated in-browser.

### Quality override

Rendering quality is auto-detected from the device, but you can force it:

| URL | Effect |
|---|---|
| `?q=high` | Full effects — reflective floor, depth of field, soft shadows, slat wall |
| `?q=medium` | Balanced (default on most laptops) |
| `?q=low` | Minimal effects, best for low-end phones |

---

## What's in here

| Section | Notes |
|---|---|
| Hero showroom | Backlit plate on a walnut table, mouse/touch reactive camera, parallax, float |
| Cinematic scroll | 11 beats across a 700vh sticky act: dark room → lamp emerges → turns on → 360° → orbit → showroom awakens → collection |
| 3D collection | Four lamps as real objects on the table. Hover for light/rotation/pricing, click for detail |
| Product detail | Fullscreen viewer: orbit, zoom, pan, light on/off, brightness, colour temperature, dark-room mode |
| See it in your space | Same lamp relit for bedroom / living room / study / office / bedside |
| Gifting | Gift box opens on scroll with warm light emerging |
| Why SD LIVING | Four floating gold ring elements with line icons |
| Commerce | Search, categories, filters, sort, wishlist, cart, checkout, order summary, reviews, related products |
| WhatsApp | Floating FAB + per-product order messages to 9146525702 |

---

## Project layout

```
public/art/              generated lamp artwork (panel + window textures)
public/art/raw/          source line-art plates
src/three/               all 3D: Lamp, Room, ShowroomScene, ProductViewer,
                         GiftScene, WhyScene, StudioEnv, Effects, textures
src/components/          Nav, Experience (persistent canvas), Sections,
                         ProductModal, Panels, Overlays, Brand, EnterGate
src/data/products.js     catalogue, rooms, reviews, FAQ
src/store/useStore.js    Zustand store + pure derived helpers
tools/build_art.py       art → texture pipeline (python3 tools/build_art.py)
tools/shoot.cjs          headless screenshot QA harness
```

### Canvas strategy

One persistent full-screen `<Canvas>` drives the hero, the cinematic act and the
collection. Gifting, Why and See-in-your-space each get a section-scoped canvas
that only mounts once it has been seen; the product detail modal gets its own.
Off-screen canvases are parked via `frameloop="demand"`.

### A few deliberate choices

- **No GLTF/GLB.** Every lamp is procedural geometry plus canvas-generated
  textures, so there is nothing to download and nothing to decode.
- **No `<Environment preset>`.** Those fetch HDRIs from a CDN at runtime and the
  daylight window reflects as a hard-edged rectangle across the acrylic. Replaced
  with `src/three/StudioEnv.jsx`, a tiny baked Lightformer rig.
- **Halos are planes, not sprites.** A sprite billboards about its centre, so
  off-axis its near edge swings in front of the lamp plate and clips against it.
- **Time-based reveals use `performance.now()`**, never accumulated `dt`. Clamped
  deltas make animations 10× too slow on weak GPUs.

---

## Notes

Pricing, ratings and review counts are realistic placeholders — swap them in
`src/data/products.js` before going live. Checkout is a front-end flow only;
wire it to a payment provider or let it fall through to WhatsApp ordering.

# 197 Historias Ilustradas — Interactive Memorial Gallery

A production-ready, standalone interactive memorial gallery replicating the navigation, typography, and motion physics of the award-winning **"197 Historias Ilustradas"** (*197 Illustrated Stories*).

Built with **React**, **Tailwind CSS**, hardware-accelerated DOM transforms, and custom **linear interpolation (lerp) deceleration physics**.

---

## 1. Motion & Physics Core (Deep Dive)

The defining hallmark of *197 Historias Ilustradas* is its weightless, fluid 2D canvas navigation that feels like an infinite archival desk gliding underneath your fingers.

### A. Natural Trackpad 2D Pan (No Click-and-Drag)
* **Zero Grab Hands:** The cursor deliberately remains the default arrow pointer (`cursor-default`) or precision crosshair. There is no dragging, dragging ghosts, or text selection during navigation.
* **True 2D Panning:** Moving two fingers across a MacBook trackpad or scrolling with a mouse wheel navigates both horizontal ($X$) and vertical ($Y$) axes simultaneously with zero axis locking.
* **Touchscreen Support:** Mobile/tablet users can pan with standard one-finger swipes that feed directly into the momentum engine.

### B. Event Interception & Delta Normalization
The browser's native `wheel` event is intercepted with `{ passive: false }` to block standard page scrolling and prevent browser bounce-backs while feeding raw deltas into the physics loop:

```javascript
window.addEventListener('wheel', onWheel, { passive: false });

function onWheel(e) {
  // Respect scrollable modals and search drawers
  if (e.target.closest('[data-scrollable="true"]')) return;

  e.preventDefault();

  let dx = e.deltaX;
  let dy = e.deltaY;

  // Normalize delta across input devices
  if (e.deltaMode === 1) {
    // Traditional notched mouse wheel (DOM_DELTA_LINE)
    dx *= 24;
    dy *= 24;
  } else if (e.deltaMode === 2) {
    // Page scrolling (DOM_DELTA_PAGE)
    dx *= window.innerWidth * 0.7;
    dy *= window.innerHeight * 0.7;
  }

  dx *= deltaMultiplier;
  dy *= deltaMultiplier;

  targetX -= dx;
  targetY -= dy;
}
```

### C. Inertial Momentum & Deceleration (Lerp Physics)
Instead of abrupt positional updates, the engine implements a continuous `requestAnimationFrame` linear interpolation loop:

$$\text{currentX} \leftarrow \text{currentX} + (\text{targetX} - \text{currentX}) \times \text{damping}$$
$$\text{currentY} \leftarrow \text{currentY} + (\text{targetY} - \text{currentY}) \times \text{damping}$$

* When trackpad swiping ceases, `targetX` comes to rest, while `currentX` smoothly glides toward it with exponential decay, producing a weightless, organic museum glide.
* **Hardware Acceleration:** The canvas position is applied via direct CSS transform string:
  ```javascript
  canvasElement.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
  ```
  Coupled with `will-change: transform`, this renders on GPU compositing layers at native 120Hz/60Hz refresh rates.

### D. Boundary Elasticity (Rubber-Band Resistance)
When users approach the edges of the 3600px × 2400px canvas, progressive spring resistance dampens the target position:
```javascript
if (nextX > maxX) {
  nextX = maxX + (nextX - maxX) * 0.35; // 65% resistance
}
```
During the tick loop, if the target exceeds bounds, it is smoothly pulled back toward the boundary cushion:
```javascript
if (target.x > maxX) target.x += (maxX - target.x) * 0.12;
```

---

## 2. Tuning the Inertia & Physics Engine

You can tune the physics live directly inside the application by clicking the **Physics HUD** icon in the header (or configure values in `src/hooks/useInertiaPan.js`):

| Parameter | Recommended | Range | Effect |
| :--- | :--- | :--- | :--- |
| **`damping`** | `0.08` | `0.03 – 0.20` | Controls deceleration rate. `0.04` produces a floaty, icy glide. `0.15` produces tight, snappy response. |
| **`deltaMultiplier`** | `1.0` | `0.4 – 2.5` | Sensitivity factor for trackpad/wheel deltas. Increase for larger screens or fast navigation. |
| **`rubberBand`** | `true` | `boolean` | Enables organic boundary cushioning when reaching canvas edges. |
| **`invertPan`** | `false` | `boolean` | Inverts trackpad movement direction if desired. |

### Mathematical Tuning Guidelines
* **For a Silkier / More Weightless Feel:**
  Set `damping: 0.06` and `deltaMultiplier: 1.1`.
* **For High Precision / Controlled Stop:**
  Set `damping: 0.12` and `deltaMultiplier: 0.9`.

---

## 3. Architecture & Views

### A. Top Sticky Header
* **Counter Badge:** `197 HISTORIAS ILUSTRADAS` with live filtered count `[28/197]`.
* **Collapsible `FILTERS [+]` Drawer:** Filter by field (Education, Arts, Students, Health, Trades) and location (Montevideo, Buenos Aires, Interior).
* **Segmented View Switcher:**
  * `[ GRILLA / GRID ]` (Key: `1`): Free 2D boundless canvas with staggered organic card placement.
  * `[ LISTADO / LIST ]` (Key: `2`): Archival typographic registry table with sortable columns and hover indicators.
  * `[ GALERÍA / GALLERY ]` (Key: `3`): Curated museum exhibition showcase with editorial quotes and large illustrations.
* **Archival Tools:**
  * **Search (`⌘K` / `Ctrl+K`):** Instant search modal querying names, numbers, professions, and biographies.
  * **Language Switcher:** Instant bilingual toggling between **Spanish** (authentic memorial voice) and **English**.
  * **Memorial Audio Engine:** Micro-synthesized subtle harmonic chime on interaction (Web Audio API, mute toggle).
  * **Radar Mini-Map:** Viewport anchor box in the bottom right corner showing real-time $(X,Y)$ position on the 2D plane.

### B. Staggered Portrait Grid
* **Organic Distribution:** Cards are arranged across 6 columns with staggered baseline Y-offsets (`+140px`, `+260px`, `+110px`, etc.) and micro-jitter to avoid rigid grid monotony.
* **Card Anatomy:**
  * Monospace label directly above frame: `148. José Pedro` and year/location.
  * Archival double-border passe-partout matting.
  * Warm grayscale image filter that reveals subtle rich color and elevation (`scale(1.025)`) on hover.
  * Clicking any card opens the comprehensive **Archival Dossier Modal** with biography, illustrator credits, and prev/next browsing.

---

## 4. Quick Start Instructions

### Option 1: Standalone Single-File (Zero Install)
You can run this project immediately with zero package installations:

1. Simply double-click `index.html` in your browser, or:
2. Run a local web server:
   ```bash
   python3 -m http.server 3000
   ```
3. Open `http://localhost:3000` in Chrome, Safari, or Edge.

### Option 2: Modular React Project
The modular source code is organized cleanly in `src/`:
* `src/App.jsx` — Core state and view router
* `src/hooks/useInertiaPan.js` — Standalone 2D physics lerp engine
* `src/data/stories.js` — 28 curated portrait stories with full bilingual metadata
* `src/components/Header.jsx` — Museum header & segmented toggles
* `src/components/GridView.jsx` — 2D canvas with organic staggered cards
* `src/components/ListView.jsx` — Archival table registry
* `src/components/GalleryView.jsx` — Curated showcase
* `src/components/DetailModal.jsx` — Archival biographical dossier
* `src/components/PhysicsHUD.jsx` — Real-time telemetry and physics tuner
* `src/components/MiniMap.jsx` — Viewport radar

---

## 5. Keyboard Shortcuts
* `1` — Switch to **Grid View** (2D Pan)
* `2` — Switch to **List View** (Archival Table)
* `3` — Switch to **Gallery View** (Curated Exhibition)
* `⌘K` or `Ctrl+K` — Open Search Modal
* `ESC` — Close any open modal / drawer

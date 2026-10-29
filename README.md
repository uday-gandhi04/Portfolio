# Uday's Stack — interactive 3D portfolio starter

A React + Three.js starter inspired by the supplied top-down town map. It starts in isometric exploration mode and lets visitors switch to a car-following driving POV.

## Features in this starter

- Isometric overview with orbit/zoom controls
- Driving POV with a follow camera
- Keyboard driving: **WASD** or **arrow keys**
- Touch driving controls on small screens
- Clickable project buildings and floating labels
- Project spotlight panel and an **All Projects** directory
- Responsive overlay UI
- `public/reference-map.png` keeps the supplied map nearby as a visual reference

## Run locally

Requires Node.js 18.17+ (Node 20 LTS or newer recommended).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build:

```bash
npm run build
npm run preview
```

## Before publishing

1. Review the project descriptions and links in `src/data/projects.js`.
2. Replace placeholders with verified details, screenshots, and demos.
3. Add a real resume PDF and update the About / Resume action.
4. Test keyboard, touch, and reduced-motion behaviour on mobile and desktop.
5. Optimise 3D models and test performance on a mid-range phone.

## Controls

- **Isometric:** drag to orbit, scroll/pinch to zoom, click a building to open its details.
- **Driving POV:** W / Up = accelerate, S / Down = reverse, A / Left and D / Right = steer.
- Use the POV switcher or **Exit drive** to change back at any time.

The project is an initial prototype, not a fully polished game. Buildings are procedural low-poly approximations and the scene can be refined in Blender after interaction and navigation are stable.

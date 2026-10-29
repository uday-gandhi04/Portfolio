# Uday's Stack — Interactive 3D Portfolio

**Live website:** https://udaygandhi.is-a.dev

Uday's Stack is a personal developer portfolio presented as an
interactive 3D town. Each building represents a project, giving
visitors a more visual way to explore my work in software engineering,
full-stack development, and AI/ML.

## Features

- Interactive isometric 3D town
- Switchable isometric and driving POV camera modes
- Clickable project buildings and floating labels
- Project details with technologies, highlights, and available links
- All Projects directory
- Uday's HQ with education, experience, technical skills, and contact links
- Downloadable résumé
- Keyboard and touch controls for driving mode
- Responsive interface with a dark teal and warm gold theme

## Technology Stack

- React
- Vite
- Three.js
- React Three Fiber
- React Three Drei
- CSS

## Getting Started

Requires Node.js 18.17 or newer.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Controls

- **Isometric:** drag to orbit, scroll/pinch to zoom, and click a building to open its details.
- **Driving POV:** W / Up to accelerate, S / Down to reverse, and A / Left or D / Right to steer.
- Use the POV switcher or **Exit drive** to return to the isometric view.

# AGENTS.md

## Cursor Cloud specific instructions

This is a static frontend project (Vite + vanilla JS + GSAP + Three.js). There is no backend, database, or external service dependency.

### Running the app

- **Dev server:** `npm run dev` (serves on `http://localhost:5173` with HMR). Use `--host 0.0.0.0` if you need external/container access.
- **Build:** `npm run build` (outputs to `dist/`)
- **Preview build:** `npm run preview`

See `package.json` scripts and `README.md` for full details.

### Key notes

- Three.js is loaded via CDN (`unpkg.com`), not installed as an npm dependency. Internet access is needed for the 3D canvas to render.
- Google Fonts (Nunito Sans) are also loaded via CDN. Without internet, the font falls back to system sans-serif.
- There are no linting tools, automated tests, or pre-commit hooks configured in this project.
- The project uses ES modules (`"type": "module"` in `package.json`).

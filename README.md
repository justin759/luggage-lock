# Inside the Lock

An educational, standalone 3D model of a resettable three-dial luggage lock.

Live app: https://justin759.github.io/luggage-lock/

The GitHub Pages entry point is `index.html`. It embeds the app CSS, JavaScript, Three.js r160 UMD build, and the Three.js MIT license, so the page does not need external assets at runtime.

## Run Locally

Open `index.html` directly in a modern browser, or serve the project root:

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8767/`.

## Development

Edit the source files in `work/app/`, then rebuild the standalone HTML:

```sh
python3 work/build.py
node --check work/app/app.js
node --check work/app/gestures.js
node work/check-gestures.cjs
node work/check-reset-clearances.mjs
```

The generated standalone files are:

- `index.html`, used by GitHub Pages.
- `outputs/luggage-lock.html`, retained as the original local deliverable.

Project notes and mechanical constraints are in `AGENT.md`.

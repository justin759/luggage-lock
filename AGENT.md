# Luggage lock development notes

Updated 12 September 2026.

## Project and deliverable

This is a standalone, educational 3D model of a resettable three-dial luggage lock. It supports direct operation of the modeled parts, inspection from different angles, and responsive portrait and landscape layouts. It deliberately omits zipper pullers and the zipper.

The active workspace is `/Users/rt/Documents/Antigravity/luggage-lock`. The latest working sources were copied here from `/Users/rt/Documents/Codex/2026-09-11/files-mentioned-by-the-user-codex` when the user changed workspaces. Continue development here.

The deliverable is `outputs/luggage-lock.html`. It embeds its CSS, JavaScript, Three.js r160 UMD build, and the Three.js MIT license. It needs WebGL but no installation or external asset requests. The user explicitly prohibited the Sites skill; the local build and preview do not use Sites or the existing `.openai` metadata.

## Files and commands

| File | Purpose |
| --- | --- |
| `work/app/app.js` | State transitions, Three.js geometry, rendering, raycasting, camera, keyboard controls |
| `work/app/gestures.js` | Shared mouse, pen, and touch gesture controller |
| `work/app/index.html` | Page template, semantic model controls, educational text |
| `work/app/style.css` | Page appearance and responsive layouts |
| `work/build.py` | Embeds the source files into the standalone deliverable |
| `work/three.min.js`, `work/three-LICENSE.txt` | Bundled renderer and license |
| `work/check-reset-clearances.mjs` | Analytic checks of the critical reset clearances |
| `work/check-gestures.cjs` | Tests production gesture handling with pointer sequences |
| `outputs/README.md` | User instructions |
| `outputs/browser-retest.md` | Iteration and verification history |

Edit the source files rather than the generated HTML, then build:

```sh
python3 work/build.py
node --check work/app/app.js
node --check work/app/gestures.js
node work/check-gestures.cjs
node work/check-reset-clearances.mjs
```

Local preview:

```sh
python3 -m http.server 8767 --bind 127.0.0.1 --directory outputs
```

For a phone on the same LAN, find the Mac's current Wi-Fi address with `ipconfig getifaddr en0` and bind a server to that address. The current LAN preview was started with:

```sh
python3 -m http.server 8767 --bind 192.168.0.98 --directory outputs
```

The phone URL is `http://192.168.0.98:8767/luggage-lock.html`. It returned HTTP 200 and exactly matched the current build when checked from the Mac. The address can change when the network changes. The serving Mac and server process must stay running. Only the `outputs` directory is served.

## Development history and accepted behavior

1. Built the educational lock with Cutaway, Assembled, and Exploded views, manual dial selection, opening, and combination setting.
2. Moved operating controls onto the actual model. Removed side-panel dial controls, reset buttons, release buttons, and automatic alignment. Saving and closing never turn or scramble the wheels.
3. Removed shadows, enlarged the open latch/socket separation, and removed the casing from Exploded view. Exploded view is static inspection, not an animated disassembly sequence; operating controls are disabled there.
4. Corrected the reset mechanism after the user pointed out that the casing prevents lateral movement of the number wheels. Fixed bearings and close-fitting casing windows retain the dials; only the pin, yoke, and internal sleeves translate during reset.
5. Added a compact landscape layout. At 844 × 390 the stage is 326px tall and its control strip is 52px, allowing both to fit once scrolled into view.
6. Centered paired housing index marks and placed the selected digits at the physical crowns of the wheels.
7. Corrected the return interlock after the user found that the latch could otherwise close while the clutches were disengaged. A broad reset tongue now crosses behind the carriage stop. Clicking the release while setting demonstrates actual contact with that stop.
8. Applied the latest visual and input changes: overhead lighting, requested material colors, no rendering labels or captions, closer zoom, tap activation, touch wheel dragging, and two-finger pinch zoom.

Earlier mechanical iterations received independent critic reviews. The crown/interlock iteration ended with a satisfied critic. The latest appearance/touch iteration was self-tested without a critic, as explicitly requested by the user; do not present the earlier verdict as a new review.

## Mechanical model: constraints to preserve

This is a simplified teaching mechanism, not a manufacturing drawing or an exact reconstruction of a particular commercial product. Its dimensions are illustrative, but force paths and clearances are explicitly modeled.

- The x axis follows the common dial shaft, y is vertical, and the carriage opens along negative z.
- Dial centers are x = −2.95, −1.35, 0.25, with shaft center y = 0.61 and z = −0.21. They remain axially fixed during reset. Rotating dial flanges straddle stationary retainers with 0.01 axial play per side.
- The normal sleeve centers are x = −2.30, −0.70, 0.90. Reset translates them and their captured yoke by +0.26. Captured thrust rings provide a continuous connection to the sleeves; the outer dials do not translate.
- The fence, connecting stem, latch tongue, lower return bridge, reset stop, and moving spring seat form one rigid carriage. Its open travel is −0.30. Its compression spring has a fixed seat and a carriage seat.
- All three wide fence fingers must enter the sleeve notches before the carriage can open. During reset they retain sleeve alignment across the complete axial stroke. The clutch faces have a 0.08 gap at full reset.
- The broad reset tongue occupies x = [−3.94, −3.61] before translation. At full reset it overlaps the carriage stop axially by 0.12 and vertically by 0.10.
- Return play against the reset tongue is 0.005. Contact limits the carriage to z travel −0.295 and leaves a 0.175 latch/socket gap. The simulated blocked attempt must not pass through the tongue.
- Tongue/stop overlap begins after 0.01 of reset travel; clutch axial engagement ends at 0.18. Consequently the interlock engages before the clutches disconnect and clears only after they reconnect.
- The selected digit is at angular phase zero at the wheel crown. The index marks and casing window centers share the shaft center line. Do not restore the former +0.59-radian number offset.
- Joined members intentionally meet or overlap at their connections. Separate moving parts need clearance; do not substitute invisible state restrictions for missing physical connections or stops.

The analytic sweep samples 101 reset positions and checks these key relationships. It is not a general collision detector or manufacturing tolerance analysis.

## State and interaction model

Initial digits are 000 and the reference code is 314. State modes are `locked`, `open`, and `setting`. Clicking simulates holding the release or reset pin in its operating position. Transitions wait for the model to settle before the next operation becomes available.

Normal sequence: manually select the code → activate the orange release → activate The purple reset pin → select new digits → activate the pin to save → activate the release to close. The wheels remain at the chosen digits; turn one manually to block opening again. Reloading starts a new lesson; there is no persistent saved code.

Pointer activation raycasts the actual geometry. The projected `.model-hit` buttons are keyboard focus surfaces with `pointer-events: none`; they must not intercept nearby model taps. Keyboard input supports arrows and digits on a wheel, and Enter on the release or pin.

`gestures.js` tracks active pointer IDs. A short tap activates a part; a wheel drag turns one detent per accumulated 22px, including multiple detents in a fast move. Background dragging orbits. Once two fingers are down, the pinch owns the gesture until every finger lifts, preventing accidental wheel turns or taps. Cancellation, lost capture, and window blur clear pending input.

Zoom distance ranges from 5 to 32, initially 18; the old minimum was 13. Pinch and wheel zoom use a focus point under the gesture so small components can be inspected closely. The zoom buttons also work. Restore camera view clears the focus offset and restores the initial angle and distance.

## Current appearance

| Element | Material color |
| --- | --- |
| Number drums / rim | Dark gray `#303338` / `#44484e` |
| Entire rigid moving fence and latch carriage | Green `#338f81` |
| Release cap and grips | Orange `#ef781f` |
| Reset pin head | Violet `#8e53c1` |
| Base top | Light gray `#cbd0d5` |
| Base rim and rails | Dark gray `#34383e` |

The directional key is white and directly overhead at (0, 12, 0), supported by neutral hemisphere illumination. There are no angled directional fill lights and no cast shadows. Fixed socket/support parts remain visually distinct from the single moving green carriage. Material appearance varies naturally with illumination.

There are no part-name labels, caption overlays, or Labels toggle in the rendering view. Numbers and physical index marks remain. View buttons, zoom controls, keyboard focus indicators, and the educational text outside the model remain available.

## Latest verification

- Internal-browser visual checks confirmed the materials, overhead lighting, and label-free rendering.
- Portrait widths 390 and 320 and landscape 844 × 390 had no horizontal overflow. The compact landscape stage/control height remained 326 + 52px.
- Closest zoom reached exactly 5; Restore camera view returned it to 18. Assembled digits remained at zero crown phase; Exploded remained inspection-only.
- Chrome-generated touch events verified one-tap/one-step behavior, a three-step wheel drag, and pinch zoom from 18 to 9 and back to 18 with unchanged digits.
- Touch activation of the orange release and violet pin completed opening, reset, blocked closing during reset, saving 826, and closing. Dials remained axially fixed and digits remained 826 after saving/closing.
- Gesture unit checks passed for jitter, small accumulated moves, fast drags, pinch direction, prevention of extra taps, cancellation, a third finger, blur, and orbiting.
- Syntax and the mechanical clearance sweep passed. No browser runtime errors were observed. The embedded Three.js UMD build retains its existing deprecation warning.

The internal browser does not support CDP `Input.dispatchTouchEvent`; a temporary Chrome tab was used for multi-touch verification. Touch emulation and viewport overrides were cleared afterward, and the temporary Chrome tab was closed. These were browser-generated touch tests; the LAN preview allows the user to check their physical phone.

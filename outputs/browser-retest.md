# Browser retest — 11 September 2026

Tested the standalone `luggage-lock.html` in the Codex internal browser using the local HTTP preview.

## Reset correction

Positions below are read from the animated Three.js objects through the stage's diagnostic attributes; units are illustrative model units.

| State | Number dial axial positions | Sleeve axial positions |
| --- | --- | --- |
| Before reset | −2.95, −1.35, 0.25 | −2.30, −0.70, 0.90 |
| Reset engaged | −2.95, −1.35, 0.25 | −2.04, −0.44, 1.16 |
| Turning digits in reset | −2.95, −1.35, 0.25 | −2.04, −0.44, 1.16 |
| Saved | −2.95, −1.35, 0.25 | −2.30, −0.70, 0.90 |

The outer number dials remain fixed. The pin, connected yoke, and inner sleeves move 0.26 units during reset. The sleeves return when the code is saved.

## Interaction checks

- Reset is blocked while locked; an incorrect code blocks opening.
- The initial code 314 opens the lock.
- Changing the code to 826, saving, and closing preserves all chosen digits.
- The old code 314 fails after the change; 826 reopens the lock.
- At 390 × 844, direct canvas clicks activate the release and reset pin without accidentally turning the adjacent dial.
- Direct wheel clicking and dragging change digits; clicking the reset pin saves the new code 936.
- Closing preserves 936. A manual click then wraps the first dial from 9 to 0.
- Model controls work with keyboard digits and Enter.
- Assembled view retains its close-fitting dial windows. Exploded view has no casing and disables operation for static inspection.
- No operating buttons remain in the side panel. No horizontal overflow at 390 × 844, 320 × 740, or 844 × 390.
- No browser runtime errors. The embedded Three.js build emits its existing UMD deprecation warning.

Source syntax and the 101-position analytic reset-clearance check also pass. The clearance check covers the modeled clutch, shaft stops, retainers, casing windows, pin guide, and reset interlock; it is not a manufacturing tolerance analysis.

## Landscape improvement and critic review

The first browser critic independently confirmed the reset correction and found one layout issue: the 490px stage was too tall for a short landscape viewport. The subsequent iteration adds a compact landscape rule, with no changes to mechanism geometry or state transitions.

| Viewport | Model stage | View-control strip | Combined height |
| --- | --- | --- | --- |
| 844 × 390 | 326px | 52px | 378px |
| 667 × 375 | 311px | 52px | 363px |

Browser screenshots confirm the full cutaway and exploded mechanisms fit with their view controls once scrolled into view. Direct release and reset clicks also pass in the compact landscape layout, with unchanged dial positions. Portrait 390 × 844 retains its 410px stage and has no horizontal overflow.

The preceding critic found no additional mechanical or interaction issues. The subsequent changes below include a fresh independent review.

## Crown alignment and latch-return interlock — 12 September 2026

The selected digit now sits at zero angular offset from the physical crown of the wheel. Both casing index marks and the window center share the shaft's center line. A near-overhead browser inspection with digits 403 confirmed their visual alignment; measured selected-digit angles were all 0.0000 radians. The direct interaction targets follow the new crown position.

The reset tongue now has 0.12 units of axial overlap and 0.10 units of vertical overlap with the open carriage stop. Its return clearance is 0.005 units. The stop therefore limits carriage travel to −0.295, retaining a 0.175-unit latch/socket gap. The tongue engages after 0.01 units of reset travel, before clutch separation at 0.18 units, and remains engaged until the clutches reconnect.

Browser retesting confirmed:

- A release click during reset attempts to close against the physical tongue. Across 36 animation samples, the minimum contact gap was zero, the axial overlap remained 0.12, and maximum return travel was −0.295. The app remained in code-setting mode.
- Saving withdraws the tongue and returns the sleeves; closing then succeeds. The three dial positions remain −2.95, −1.35, 0.25 throughout. Digits remain unchanged by saving or closing.
- Code 826 was saved successfully and the old code 314 failed.
- At 390 × 844, direct clicks on the release, reset pin, and wheel crown worked. A wheel drag worked, code 936 saved, and closing succeeded.
- The compact landscape stage remains 326px plus its 52px control strip at 844 × 390, with no horizontal overflow. Exploded view remains casing-free and inspection-only.
- No browser runtime errors. The existing Three.js UMD deprecation warning remains.

The updated 101-position analytic sweep also passes, including return-interlock overlap whenever the clutches are disengaged. The independent critic returned **SATISFIED**, with no blocking findings, after its own source-clearance audit, visual index inspection, direct reset-stop contact test, and successful code-save/close test.

## Appearance and touch update — 12 September 2026

This iteration was self-tested without a critic, as requested. The active project is now `/Users/rt/Documents/Antigravity/luggage-lock`.

- Internal-browser visual inspection confirmed overhead lighting, dark gray wheels, a consistently green carriage, orange release cap, violet reset head, light gray base, and dark gray base rim. Rendering labels, captions, and the Labels toggle are absent.
- There was no horizontal overflow at 390px or 320px portrait widths, or at 844 × 390 landscape. The compact landscape stage and control strip measured 326px + 52px.
- Zoom reached distance 5, and camera restore returned to 18. Assembled crown phases remained zero; Exploded operation remained disabled.
- Native touch events generated through Chrome CDP advanced a wheel once per tap and turned three detents during a 66px drag.
- A two-finger spread changed camera distance from 18 to 9, and a reverse pinch restored 18. Digits stayed 130 throughout both pinches.
- Touch taps opened code 314, engaged reset, demonstrated the blocked return interlock, saved code 826, and closed. Dial centers remained fixed and digits remained 826 after save/close.
- Production gesture tests, JavaScript syntax checks, and the 101-position reset-clearance sweep passed. No runtime errors were observed.

The internal browser lacks native touch-event dispatch, so the touch checks used a temporary Chrome tab. Temporary touch emulation and viewport overrides were removed after testing, and the Chrome tab was closed.

The requested LAN preview is available at `http://192.168.0.98:8767/luggage-lock.html` while the serving Mac remains on this network and the server is running. An HTTP check through that LAN address returned 200 and matched the generated HTML exactly.

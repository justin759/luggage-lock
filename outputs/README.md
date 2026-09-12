# inside the lock

Open `luggage-lock.html` in a modern browser. It is a standalone file: Three.js is embedded, and no installation or network connection is required. WebGL must be available.

- Click a number wheel to advance one digit; drag up or down to turn either way. Shift-click turns backward.
- The selected digit sits at the physical top of each wheel. Paired marks at the middle of each casing window identify it.
- The initial reference combination is **3 1 4**.
- Click the orange release cap on the right to open or close.
- While open, click the small violet reset pin at the left end. Turn the wheels, then click the pin again to save.
- During reset, click the release to test the return interlock: a tongue on the reset yoke physically keeps the latch out of its socket.
- Closing and saving never turn or scramble the wheels. Turn a wheel manually to block the release again.
- Tap a model part to activate it. Drag a number wheel to turn it, or drag the background to orbit. Pinch with two fingers to zoom; scroll and the zoom buttons also work. Pinching cannot turn the wheels. Restore camera view returns to the initial framing.
- Tab to a model part for keyboard access. Use arrow keys or type a digit on a wheel; Enter activates a release or reset pin.

Cutaway and Assembled views operate the connected mechanism. Exploded view removes the casing and separates parts for static inspection; operation is disabled in that view. Shadows are disabled.

During reset, the number dials remain axially fixed in their retainers and casing windows. The reset pin moves a yoke that slides the internal sleeves away from the dial clutch teeth; wide fence fingers keep the sleeves aligned throughout their travel. A broad tongue on that yoke slides behind a stop connected to the latch carriage, preventing it from closing. The tongue enters the return path before the clutches separate and leaves only after they re-engage.

This is a simplified educational model, not a manufacturing drawing or an exact reconstruction of a particular commercial lock. Clicking simulates holding the release open or pressing the reset pin. The mechanical interlock retains the carriage during code setting. Linkages, shaft bores, clutch clearances, spring seats, reset interlocks, and latch engagement were reviewed in successive critic iterations.

Browser checks covered direct pointer operation, reset pin behavior next to the first wheel in portrait, blocked opening, successful opening, code changes, rejection of the old code, digit wraparound, unchanged digits after saving/closing, keyboard access, view controls, and responsive portrait/landscape layouts.

Latest reset correction: stationary dial retainers and narrower casing windows prevent lateral dial motion. A 101-position analytic clearance sweep passed, and an independent critic approved the mechanical correction from source. Fresh testing in the internal browser confirmed that the three dial positions remain unchanged during reset, dial turning, saving, and closing; only the internal sleeves translate by 0.26 model units. Direct pointer and keyboard tests verified the complete code-change cycle. See `browser-retest.md` for details.

The latest appearance uses a light directly overhead, dark gray number wheels, one consistent green material for the entire moving fence and latch carriage, an orange release cap, a violet reset head, and a light gray base with a dark gray rim. No labels or caption overlays appear inside the rendering view. Zoom distance ranges from 5 to 32 model units (initially 18).

Development notes, critical geometry, and build/test instructions are in `../AGENT.md`. The latest iteration was self-tested without a critic, as requested.

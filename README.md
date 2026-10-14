# E-Scooter Smart Wheel Analyzer

An interactive physics simulation for **Rotational Motion**. The user enters a wheel radius and motor speed, and the program calculates and visualizes the rotational dynamics of an electric scooter tire.

## 1. How to run

1. Keep these three files **in the same folder** (this is the whole project to submit for Phase 1):
   - `index.html`
   - `style.css`
   - `script.js`
2. Double-click `index.html` (it opens in Chrome, Edge or Firefox).
3. No installation, server or internet connection is needed.

To edit the program, open the files in Notepad, VS Code or any text editor, save, then refresh the browser.

> The slides and the video guide for Phase 2 are in the separate sibling folder `presentation` (they are not needed to run or submit this project).
> After you change any code here, run `node make-source-data.js` inside the `presentation` folder so the slides show the new code.

## 2. How to use

| Step | Action |
|---|---|
| 1 | Enter the **wheel radius** `r` and choose its unit (m, cm or in). It is converted to meters (0.01 – 1 m). |
| 2 | Enter the **motor speed** `N` in RPM (1 – 3000). |
| 3 | Enter the **time** `t` in seconds (0 – 3600). |
| 4 | Read the results; they update while you type, or press **Calculate**. |
| 5 | Watch the rotating wheel and move the slow-motion slider. |
| 6 | Solve ω, v<sub>t</sub> and a<sub>c</sub> by hand, type your answers in the **Test panel** and press **Check answers**. |

Preset buttons (Kick scooter, City e-scooter, Fast commuter) fill in sample values. **Reset** returns to the defaults.

## 3. Physics used (all SI units)

| Quantity | Formula | Unit |
|---|---|---|
| Angular velocity | ω = 2πN / 60 | rad/s |
| Tangential speed | v<sub>t</sub> = ω · r | m/s |
| Centripetal acceleration | a<sub>c</sub> = ω² · r (= v<sub>t</sub>² / r) | m/s² |
| Period | T = 60 / N | s |
| Angular displacement | θ = ω · t | rad |
| Arc length (distance rolled) | s = θ · r | m |

Where `N` is the motor speed in RPM and `r` is the wheel radius in meters.

**Example:** r = 0.12 m, N = 600 RPM
- ω = 2π(600)/60 = 62.832 rad/s
- v<sub>t</sub> = 62.832 × 0.12 = 7.540 m/s (27.1 km/h)
- a<sub>c</sub> = 62.832² × 0.12 = 473.74 m/s² (≈ 48.3 g)

## 4. How the project was built

### Step 1: Plan the page (`index.html`)
The HTML holds only the structure. It is divided into cards:
1. Input card (radius, RPM, time, presets, buttons)
2. Results card (six tiles, each showing its formula)
3. Live wheel (`<canvas id="wheelCanvas">`) with speed slider and pause button
4. Graph (`<canvas id="graphCanvas">`)
5. Step-by-step solution
6. Real-life application text
7. Test panel (table with answer boxes)

Every element that JavaScript needs has an `id`, for example `id="radius"` and `id="outOmega"`.

### Step 2: Style the page (`style.css`)
- All colors are CSS variables in `:root` at the top. Change a color there once and it changes everywhere.
- The `.layout` grid uses `repeat(auto-fit, minmax(320px, 1fr))`, so the cards sit in two columns on a computer and stack in one column on a phone.
- Result tiles use a second grid with the same idea.

### Step 3: Write the logic (`script.js`)
The file is split into 8 numbered sections:

| Section | What it does |
|---|---|
| 1. Physics formulas | Small functions (`angularVelocity`, `tangentialSpeed`, `centripetalAcceleration`, …). Numbers in, number out; they do not touch the page. `analyze()` bundles them. |
| 2. Reading inputs | `readField()` checks that each value is a number inside its allowed range and shows a red message if not. |
| 3. Showing results | `updateAll()` reads the inputs, calls `analyze()`, and writes every result and the step-by-step text to the page. |
| 4. Wheel animation | `drawWheel()` draws the tire, spokes, point P and two arrows. `animate()` runs about 60 times per second and increases the angle by `ω × slowFactor × Δt`. |
| 5. Graph | `drawGraph()` plots θ against t, a straight line whose slope is ω, with a marker at the entered time. |
| 6. Test panel | `checkAnswers()` compares the student's answers with the program values (±1% tolerance). |
| 7. Validation | `renderValidation()` compares three hand-calculated input sets and six trend checks with the program's own formulas and shows ✔/✘. |
| 8. Start-up | Connects inputs and buttons to the functions above, then starts the first calculation and the animation. |

### Step 4: How the animation works
- The wheel is drawn on an HTML `<canvas>` using `arc`, `moveTo/lineTo` and a small `drawArrow` helper.
- **Green arrow** = tangential velocity, perpendicular to the radius.
- **Orange arrow** = centripetal acceleration, pointing from point P to the center.
- Real speeds (e.g. 600 RPM = 10 turns every second) are too fast to see, so the drawing runs at a fraction of real speed, controlled by the slider (default 5%). The page states this.
- The drawing is not to true scale, and the page says so. A bigger radius always draws a bigger wheel, and a bigger value always draws a longer arrow (logarithmic scale), so the trends match the calculation.

### Step 5: How the test panel works
1. The panel shows a **Given** line, for example `Given:  r = 0.33 m,   N = 450 RPM,   t = 2 s`. The values are **random** (r = 0.05–0.40 m, N = 60–1500 RPM in steps of 30, t = 1–10 s).
2. The student calculates ω, v<sub>t</sub> and a<sub>c</sub> manually from the Given values and types the answers into the three boxes.
3. **Check answers** marks each one ✔ or ✘ (±1%) and shows a score out of 3.
4. **Clear** empties the boxes and gives a **new random Given**. **Use my analyzer values** practices with the values typed in the analyzer instead.
5. The program values stay hidden until the check is pressed, and are hidden again on Clear.

### Step 6: Validation evidence (Phase 1 requirement 10)
Section 9 of the page lists three input sets whose answers were worked out by hand:

| Case | r (m) | N (RPM) | ω (rad/s) | v<sub>t</sub> (m/s) | a<sub>c</sub> (m/s²) |
|---|---|---|---|---|---|
| 1 | 0.12 | 600 | 62.832 | 7.540 | 473.741 |
| 2 | 0.25 | 300 | 31.416 | 7.854 | 246.740 |
| 3 | 0.10 | 1200 | 125.664 | 12.566 | 1579.137 |

The hand values are fixed numbers in `VALIDATION_CASES` (`script.js`). When the page loads it runs the program's formulas on the same inputs and compares them at 3 decimal places. It also checks six trends (doubling the radius doubles v<sub>t</sub> and a<sub>c</sub>; doubling the RPM doubles ω and v<sub>t</sub> and makes a<sub>c</sub> four times larger) and shows one complete manual calculation.

## 5. Project requirements checklist (PISQ Performance Task Form)

### Minimum product requirements (Phase 1)

| # | Requirement | Where it is met |
|---|---|---|
| 1 | Runs reliably, accessible | Plain HTML/CSS/JS, no install, no internet |
| 2 | At least three Physics concepts through computation | ω, v<sub>t</sub>, a<sub>c</sub> (plus T, θ, s) in `script.js` Section 1 |
| 3 | Correct equations; assumptions stated | Formulas table; page section **8 · Model assumptions** |
| 4 | At least two adjustable physical variables | Radius r, motor speed N (and time t) |
| 5 | Results calculated from current inputs | `updateAll()` calls `analyze()` on every change; no preset answers |
| 6 | Responsive animation/graph | Rotating wheel with vectors; θ–t graph |
| 7 | Labels with units; convert non-SI to SI | Radius in m / cm / in is converted to m; RPM converted to rad/s; all outputs in SI units; graph axes labeled |
| 8 | Clear instructions and real-life application | "How to use" card at the top of the page; section 6 |
| 9 | Handles invalid input | Empty, non-numeric, zero, negative or out-of-range values show a red message and no result |
| 10 | Three input sets validated manually | Page section **9 · Validation evidence** |
| 11 | Original design; understandable code; credits | Commented code; page section **10 · Credits**, including AI assistance |

### Other points from the form

| Item | Status |
|---|---|
| Model honesty: rolling without slipping, v = rω | Stated in the assumptions section |
| Centripetal vs tangential acceleration | Assumptions state a<sub>t</sub> = 0 at constant ω; only a<sub>c</sub> points to the center |
| Animation scale declared, trends match | Notes under the wheel; wheel and arrows grow with the values |
| Radians in JavaScript trig | All angles are in radians; degrees are shown only as a conversion |
| Editable source + run instructions | `index.html`, `style.css`, `script.js`, this README |

### Where each part comes from in the PDF ("PT 1 GEN SCI.pdf")

Page numbers are the PDF page numbers. The same "PDF ref:" notes are written as comments in `script.js` and `index.html`.

| What in the program | PDF page | Part of that page |
|---|---|---|
| ω = 2πN/60, convert RPM to rad/s | p.5 | Table "Physics Equations and Model Conditions", row "Unit conversion" |
| θ(rad) = π/180 × θ(deg) | p.5 | Same row, second equation |
| v<sub>t</sub> = rω; s = rΔθ | p.5 | Row "Linear and angular connections" |
| a<sub>c</sub> = v<sub>t</sub>²/r = rω² | p.5 | Row "Centripetal acceleration" |
| θ = ωt (α = 0) | p.5 | Row "Rotation with constant angular acceleration" |
| Rolling without slipping, declared animation scale | p.5 | "Make the model honest", paragraphs 1 and 2 |
| Project idea: adjust radius and RPM, rotate a wheel, show rim values | p.4 | "Suggested Coding Projects", row "Smart Wheel Analyzer" |
| Three-case validation, hand calculation vs program | p.6 | "Show evidence for three input sets" |
| Expected trends (double r, double RPM) | p.6 | Sentence under the worked-example table |
| Table layout Case / r / N / ω / v<sub>t</sub> / a<sub>c</sub> | p.6 | "Worked example Smart Wheel Analyzer" |
| Minimum features (units, invalid input, instructions, credits) | p.3 | "Minimum product requirements", items 1–11 |
| Credits and AI acknowledgement | p.8 | "Responsible use of AI and coding resources" |
| Video contents checklist | p.7 | Phase 2 table and "Presentation requirements" |
| Scoring criteria | p.9, p.10 | Phase 1 and Phase 2 rubrics |

Not from the PDF (added by the developer): period T = 60/N, the km/h and g conversions, the m/cm/in selector factors, the input ranges, the ±1% test-panel tolerance, preset buttons and the quiz-style test panel.

### Still to do by hand (not code)

- **Fill in your name, section and contribution** in the Credits section of `index.html` (look for the orange `[ … ]` text), and in `README.md` if you want.
- **Phase 2 video (5–8 min, due October 18, 2026):** introduction; Physics concepts and equations; demonstration of three input conditions; selected code with one complete manual calculation compared to the program; reflection and credits. Show actual screen footage, explain in your own words, and mention the AI assistance.
- **Submission file name:** zip the three files and name it like `G11_Section_Group01_EScooterSmartWheelAnalyzer_Phase1.zip` (replace Section and Group). Check that it opens from another device before submitting.

## 6. Customizing

- **Change colors:** edit the variables in `:root` at the top of `style.css`.
- **Change allowed input ranges:** edit the `LIMITS` object in `script.js` (Section 2) and the `min`/`max` attributes in `index.html`.
- **Change the test tolerance:** edit `TOLERANCE` in `script.js` (Section 6).
- **Change the default values:** edit `value="..."` on the inputs in `index.html` and the reset button code in `script.js` (Section 7).
- **Change preset buttons:** edit the `data-preset="radius,rpm,time"` attributes in `index.html`.

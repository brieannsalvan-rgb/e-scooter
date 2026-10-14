/* E-Scooter Smart Wheel Analyzer - all the logic. Linked from index.html */

/* =====================================================================
   PDF REFERENCE KEY
   Source document: "PT 1 GEN SCI.pdf" - PISQ SF No. 12, Performance
   Task Form, "PHYSICS CODELAB: CODE IT, SIMULATE IT, EXPLAIN IT!"
   (General Science, Senior High School, 2026-2027), 11 pages.
   Comments marked "PDF ref:" in this file point to it like this:

     p.1   Performance Task Form (Title, Description, Performance
           Standards, Subject Matters, Materials, Classification)
     p.2   Task / completion dates table
     p.3   Phase 1 Coding Project Output: steps 1-4,
           "Minimum product requirements" items 1-11, "Phase 1 deliverables"
     p.4   "Suggested Coding Projects" table (row "Smart Wheel Analyzer"),
           "Choose a platform you can explain"
     p.5   "Physics Equations and Model Conditions" table and
           "Make the model honest" (2 paragraphs)
     p.6   "Testing and Group Responsibilities": "Show evidence for three
           input sets", "Worked example Smart Wheel Analyzer"
     p.7   Phase 2 Video Presentation
     p.8   Implementation and Submission, "Responsible use of AI and
           coding resources", "Final check before submitting"
     p.9   Phase 1 Coding Project Output Rubric
     p.10  Phase 2 Video Presentation Rubric

   A formula marked "not in the PDF" was added by the developer.
   ===================================================================== */

/* =====================================================================
   SECTION 1 — PHYSICS FORMULAS
   These are "pure" functions: numbers in, number out. They do not touch
   the page, so they are easy to read and test.

   PDF ref: p.5, "Physics Equations and Model Conditions" table.
            p.6, "Worked example Smart Wheel Analyzer" (the formula line
            ω = 2πN/60; v_t = rω; a_c = rω²).
   ===================================================================== */

/**
 * Angular velocity from motor speed.
 *   1 revolution = 2π radians, 1 minute = 60 seconds
 *   ω = 2π · N / 60
 * @param {number} rpm  motor speed N (revolutions per minute)
 * @returns {number}    ω in rad/s
 *
 * PDF ref: p.5, table row "Unit conversion", first equation ω = 2πN/60.
 *          Condition in the right column: "N is a numerical RPM input.
 *          Convert it to rad/s."  Also p.6 worked example, first formula.
 */
function angularVelocity(rpm) {
  return (2 * Math.PI * rpm) / 60;
}

/**
 * Tangential (linear) speed of a point on the tire edge.
 *   v_t = ω · r
 * This is also the speed of the scooter on the road (rolling without slipping).
 *
 * PDF ref: p.5, table row "Linear and angular connections", second
 *          equation v_t = rω ("Use radians and a fixed radius").
 *          p.5, "Make the model honest", paragraph 1 ("Rolling: use
 *          vCM = rω only for rolling without slipping").
 *          p.6 worked example: v_t = rω.
 */
function tangentialSpeed(omega, radius) {
  return omega * radius;
}

/**
 * Centripetal acceleration of a point on the tire edge.
 *   a_c = ω² · r      (same as v_t² / r)
 * It always points toward the center of the wheel.
 *
 * PDF ref: p.5, table row "Centripetal acceleration": a_c = v_t²/r = rω²
 *          ("a_c in m/s², directed toward the center. This differs from
 *          tangential acceleration."). p.6 worked example: a_c = rω².
 */
function centripetalAcceleration(omega, radius) {
  return omega * omega * radius;
}

/**
 * Period: time for one full revolution.   T = 60 / N   [s]
 * PDF ref: NOT in the PDF. Added by the developer; it follows from the
 *          p.5 "Unit conversion" idea (N revolutions in 60 seconds).
 */
function period(rpm) {
  return 60 / rpm;
}

/**
 * Angular displacement after time t (constant ω).   θ = ω · t   [rad]
 * PDF ref: p.5, table row "Rotation with constant angular acceleration",
 *          second equation Δθ = ω₀t + ½αt². With ω₀ = ω and α = 0
 *          (constant angular speed, see p.6 "This example treats a point
 *          on a wheel's rim as moving in a circle at constant angular
 *          speed") it becomes Δθ = ωt.
 */
function angularDisplacement(omega, time) {
  return omega * time;
}

/**
 * Arc length along the tire (distance rolled).   s = θ · r   [m]
 * PDF ref: p.5, table row "Linear and angular connections", first
 *          equation s = rΔθ ("s is arc length in m ... Use radians").
 *          p.1, section IV "Connections: arc length and angular
 *          displacement".
 */
function arcLength(theta, radius) {
  return theta * radius;
}

/**
 * Bundles every calculation into one object so the page can use it.
 * PDF ref: p.3, "Minimum product requirements" item 5 ("Calculate
 *          numerical results from the current inputs; preset answers or
 *          hard-coded sample results do not qualify"). Every value here
 *          is computed from the three inputs, never typed in.
 */
function analyze(radius, rpm, time) {
  const omega = angularVelocity(rpm);
  const theta = angularDisplacement(omega, time);
  return {
    omega,                                         // rad/s
    vt:    tangentialSpeed(omega, radius),         // m/s
    ac:    centripetalAcceleration(omega, radius), // m/s^2
    T:     period(rpm),                            // s
    theta,                                         // rad
    s:     arcLength(theta, radius),               // m
    revs:  theta / (2 * Math.PI)                   // number of turns
  };
}


/* =====================================================================
   SECTION 2 — READING AND VALIDATING INPUTS
   Stops bad values (empty, zero, negative, too large) before they
   reach the physics functions.

   PDF ref: p.3, "Minimum product requirements":
            item 9 ("Handle invalid input appropriately, such as
                    nonnumeric entries, a zero radius in a division, or
                    values outside the model's stated range");
            item 7 ("Convert non-SI inputs and display SI results");
            item 4 (at least two adjustable physical variables).
            p.9, rubric row "Program Functionality and Coding Logic",
            level 5 ("invalid inputs are handled clearly").
   ===================================================================== */

// Short helper: get an element by its id.
const $ = (id) => document.getElementById(id);

/**
 * Allowed ranges for each input (the "model's stated range").
 * PDF ref: p.3, "Minimum product requirements" item 9. The numeric limits
 *          themselves are the developer's choice (not in the PDF) and are
 *          printed on the page in the "How to use" card.
 */
const LIMITS = {
  radius: { min: 0.01, max: 1,    label: "Radius",     unit: "m" },
  rpm:    { min: 1,    max: 3000, label: "Motor speed", unit: "RPM" },
  time:   { min: 0,    max: 3600, label: "Time",       unit: "s" }
};

/**
 * Unit conversion for the radius input (requirement: convert non-SI
 * inputs and display SI results). "toMetres" is the multiplier that
 * changes the typed number into meters:   r[m] = typed value × toMetres
 *
 * PDF ref: p.3, "Minimum product requirements" item 7 ("Label controls,
 *          outputs and graph axes with quantities and units. Convert
 *          non-SI inputs and display SI results."). The factors
 *          1 cm = 0.01 m and 1 in = 0.0254 m are standard conversions
 *          (not in the PDF).
 */
const RADIUS_UNITS = {
  m:  { toMetres: 1,      label: "m"  },
  cm: { toMetres: 0.01,   label: "cm" },
  in: { toMetres: 0.0254, label: "in" }
};

/**
 * Checks one input field. Shows a red message if invalid.
 * The returned value is ALWAYS in SI units (radius in meters).
 * @returns {number|null} the SI number if valid, otherwise null
 */
function readField(key) {
  const input = $(key);
  const errorBox = $(key + "Error");
  const typed = parseFloat(input.value);
  const { min, max, label, unit } = LIMITS[key];

  // Radius may be typed in cm or inches: convert to meters first.
  const unitInfo = key === "radius" ? RADIUS_UNITS[$("radiusUnit").value] : null;
  const factor = unitInfo ? unitInfo.toMetres : 1;
  const value = Number((typed * factor).toPrecision(12));   // SI value

  // Case 1: empty box or non-numeric text.
  if (input.value.trim() === "" || isNaN(typed)) {
    input.classList.add("invalid");
    errorBox.textContent = `${label}: please enter a number.`;
    return null;
  }
  // Case 2: a number, but outside the model's stated range
  // (this also blocks a zero or negative radius, which would break r > 0).
  if (value < min || value > max) {
    input.classList.add("invalid");
    const shownUnit = unitInfo ? unitInfo.label : unit;
    errorBox.textContent =
      `${label} must be between ${Number((min / factor).toPrecision(6))} and ` +
      `${Number((max / factor).toPrecision(6))} ${shownUnit}.`;
    return null;
  }
  input.classList.remove("invalid");
  errorBox.textContent = "";
  return value;
}


/* =====================================================================
   SECTION 3 — SHOWING RESULTS ON THE PAGE

   PDF ref: p.3, "Minimum product requirements" item 7 (label outputs with
            quantities and units; display SI results) and item 5.
            p.1, section III "Performance Standards" ("calculates
            numerical results ... using correct equations and SI units").
            p.6, "Case 1 manual check uses full precision internally.
            Round only the displayed results." -> the values are kept at
            full precision in analyze() and rounded only by fmt() below.
   ===================================================================== */

// "state" holds the latest valid numbers. The animation and the test
// panel read from here.
const state = { valid: false, radius: 0.12, rpm: 600, time: 5, result: null };

/** Formats a number: more decimals for small numbers, fewer for big ones. */
function fmt(x, digits = 3) {
  if (Math.abs(x) >= 1000) return x.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return Number(x.toFixed(digits)).toString();
}

/** Reads inputs → computes → updates every output on the page. */
function updateAll() {
  const r = readField("radius");
  const n = readField("rpm");
  const t = readField("time");

  // If any input is invalid, stop and clear results.
  if (r === null || n === null || t === null) {
    state.valid = false;
    ["outOmega","outVt","outAc","outT","outTheta","outS"].forEach(id => $(id).textContent = "–");
    $("steps").textContent = "Please correct the highlighted input(s).";
    $("applicationLine").textContent = "";
    return;
  }

  const res = analyze(r, n, t);
  Object.assign(state, { valid: true, radius: r, rpm: n, time: t, result: res });

  // Result tiles
  $("outOmega").textContent = fmt(res.omega);
  $("outVt").textContent    = fmt(res.vt);
  $("outAc").textContent    = fmt(res.ac);
  $("outT").textContent     = fmt(res.T, 4);
  $("outTheta").textContent = fmt(res.theta);
  $("outS").textContent     = fmt(res.s);

  // Friendly conversions (1 m/s = 3.6 km/h ; 1 g = 9.81 m/s^2)
  // PDF ref: g = 9.81 m/s² is quoted on p.5 (table row "Projectile
  //          motion"). The km/h conversion is NOT in the PDF; it is an
  //          extra for readers. The SI result is always shown first.
  $("outKmh").textContent   = `m/s  (= ${fmt(res.vt * 3.6, 1)} km/h)`;
  $("outG").textContent     = `m/s²  (≈ ${fmt(res.ac / 9.81, 1)} g)`;
  // θ[deg] = θ[rad] × 180/π   (the same relation as θ[rad] = π/180 × θ[deg])
  // PDF ref: p.5, table row "Unit conversion", second equation
  //          θ_rad = (π/180) θ_deg ("Convert angular displacement in
  //          degrees to radians").
  $("outRevs").textContent  =
    `rad  (= ${fmt(res.theta * 180 / Math.PI, 1)}°  = ${fmt(res.revs, 2)} revolutions)`;

  // Show the unit conversion line only when the radius was not typed in meters.
  const unitKey = $("radiusUnit").value;
  const radiusGiven = unitKey === "m"
    ? `${r} m`
    : `${$("radius").value} ${unitKey} = ${r} m (converted to SI)`;

  // Step-by-step substitution so students can follow the math
  $("steps").textContent =
`Given:  r = ${radiusGiven},   N = ${n} RPM,   t = ${t} s

① Angular velocity
   ω = 2πN / 60 = 2π(${n}) / 60 = ${fmt(res.omega)} rad/s

② Tangential speed
   v_t = ωr = (${fmt(res.omega)})(${r}) = ${fmt(res.vt)} m/s   (${fmt(res.vt * 3.6, 1)} km/h)

③ Centripetal acceleration
   a_c = ω²r = (${fmt(res.omega)})²(${r}) = ${fmt(res.ac)} m/s²

④ Period
   T = 60 / N = 60 / ${n} = ${fmt(res.T, 4)} s

⑤ Angular displacement & arc length after ${t} s
   θ = ωt = (${fmt(res.omega)})(${t}) = ${fmt(res.theta)} rad
   s = θr = (${fmt(res.theta)})(${r}) = ${fmt(res.s)} m`;

  $("applicationLine").textContent =
    `With your values the scooter travels at ${fmt(res.vt * 3.6, 1)} km/h and covers ` +
    `${fmt(res.s, 1)} m in ${t} s, while the tire edge feels ${fmt(res.ac, 1)} m/s² ` +
    `(about ${fmt(res.ac / 9.81, 1)} g) of centripetal acceleration.`;

  drawGraph();
}


/* =====================================================================
   SECTION 4 — WHEEL ANIMATION (HTML canvas)
   Draws the wheel, a marked point on the tire edge, and two arrows:
   green = tangential velocity, orange = centripetal acceleration.

   PDF ref: p.4, "Suggested Coding Projects" table, row "Smart Wheel
            Analyzer": controls "Adjust radius and RPM; rotate a wheel and
            display values at its rim."
            p.3, "Minimum product requirements" item 6 ("Show at least one
            responsive animation, graph, diagram or simulation that
            reflects the calculated results").
            p.5, "Make the model honest", paragraph 2: "Python and
            JavaScript trigonometric functions use radians" (Math.cos and
            Math.sin below use radians) and "An animation may use a
            declared scale or slower playback, but its labels and trends
            must match the computed motion" (see the slow-motion slider,
            the scale notes and arrowLen()).
            p.5, "Centripetal acceleration" row: a_c is "directed toward
            the center" (orange arrow); v_t is along the circular path
            (green arrow).
   ===================================================================== */

const wheelCanvas = $("wheelCanvas");
const wctx = wheelCanvas.getContext("2d");

let angle = 0;          // current rotation of the wheel drawing (radians)
let paused = false;
let lastFrame = null;   // timestamp of previous frame
let groundOffset = 0;   // px: how far the ground marks have slid back (rolling)

/**
 * Draws one arrow from (x1,y1) to (x2,y2).
 */
function drawArrow(ctx, x1, y1, x2, y2, color, width = 4) {
  const head = 12;
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - 0.4), y2 - head * Math.sin(a - 0.4));
  ctx.lineTo(x2 - head * Math.cos(a + 0.4), y2 - head * Math.sin(a + 0.4));
  ctx.closePath(); ctx.fill();
}

/**
 * Pixel radius of the drawn wheels. The drawing is NOT to true scale
 * (1 m would not fit on screen), but a bigger radius always gives a
 * bigger wheel: 50 px (r = 0.01 m) up to 90 px (r = 1 m).
 */
function wheelRadiusPx() {
  return 50 + 40 * Math.sqrt((state.radius - 0.01) / 0.99);
}

/**
 * Draws ONE scooter wheel: tire with tread marks, rim ring, 6 spokes, hub.
 * "ang" is how far the wheel has turned, so the marks visibly rotate.
 */
function drawScooterWheel(ctx, cx, cy, R, ang) {
  // Tire (thick dark ring)
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = "#334155"; ctx.lineWidth = 16; ctx.stroke();

  // Tread marks on the tire: 24 short ticks that turn with the wheel
  ctx.strokeStyle = "#64748b"; ctx.lineWidth = 3;
  for (let i = 0; i < 24; i++) {
    const a = ang + (i * 2 * Math.PI) / 24;
    ctx.beginPath();
    ctx.moveTo(cx + (R + 1) * Math.cos(a), cy + (R + 1) * Math.sin(a));
    ctx.lineTo(cx + (R + 8) * Math.cos(a), cy + (R + 8) * Math.sin(a));
    ctx.stroke();
  }

  // Rim ring
  ctx.beginPath(); ctx.arc(cx, cy, R - 8, 0, 2 * Math.PI);
  ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2.5; ctx.stroke();

  // Spokes (6)
  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const a = ang + (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (R - 8) * Math.cos(a), cy + (R - 8) * Math.sin(a));
    ctx.stroke();
  }

  // Hub
  ctx.beginPath(); ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#e2e8f0"; ctx.fill();
}

/**
 * Draws the e-scooter (side view, facing right) for the current "angle".
 * The slim, dimmed body takes well under half of the picture on purpose,
 * so the eye stays on the wheels. The REAR wheel (left, driven by the
 * motor) is the analyzed wheel and carries point P and the two arrows.
 * Both wheels turn together because the scooter rolls without slipping.
 */
function drawWheel() {
  const W = wheelCanvas.width, H = wheelCanvas.height;
  const R = wheelRadiusPx();
  const groundY = H - 60;              // wheels touch the ground line
  const cy = groundY - R;              // wheel center height
  const rearX = 175, frontX = W - 175; // wheel centers
  const cx = rearX, rearCy = cy;       // analyzed wheel (used below)

  wctx.clearRect(0, 0, W, H);

  // ---- Ground with marks that slide backwards (the scooter rolls forward)
  wctx.strokeStyle = "#475569"; wctx.lineWidth = 3;
  wctx.beginPath(); wctx.moveTo(0, groundY + 9); wctx.lineTo(W, groundY + 9); wctx.stroke();
  wctx.fillStyle = "#334155";
  const spacing = 56;
  const off = ((groundOffset % spacing) + spacing) % spacing;
  for (let x = -off; x < W; x += spacing) wctx.fillRect(x, groundY + 17, 26, 4);

  // ---- Slim scooter body (thin, dim lines so the wheels stay the focus)
  const deckY = groundY - R * 0.5;
  const stemTopX = frontX - 38, stemTopY = 36;
  wctx.lineCap = "round"; wctx.lineJoin = "round";

  // Deck and the arm that joins it to the rear axle
  wctx.strokeStyle = "#64748b"; wctx.lineWidth = 12;
  wctx.beginPath();
  wctx.moveTo(rearX, cy);
  wctx.lineTo(rearX + R * 0.55, deckY);
  wctx.lineTo(frontX - R * 0.55, deckY);
  wctx.stroke();

  // Steering stem from the front axle up to the handlebar
  wctx.lineWidth = 7; wctx.strokeStyle = "#7c8ca3";
  wctx.beginPath(); wctx.moveTo(frontX, cy); wctx.lineTo(stemTopX, stemTopY); wctx.stroke();
  // Handlebar
  wctx.lineWidth = 6;
  wctx.beginPath(); wctx.moveTo(stemTopX - 6, stemTopY); wctx.lineTo(stemTopX + 34, stemTopY); wctx.stroke();

  // Mudguards over both wheels
  wctx.strokeStyle = "#475569"; wctx.lineWidth = 5;
  [rearX, frontX].forEach(x => {
    wctx.beginPath(); wctx.arc(x, cy, R + 13, Math.PI * 1.08, Math.PI * 1.92); wctx.stroke();
  });
  wctx.lineCap = "butt";

  // ---- Wheels (front: plain, rear: analyzed)
  drawScooterWheel(wctx, frontX, cy, R, angle);
  drawScooterWheel(wctx, rearX, cy, R, angle);

  // Label of the analyzed wheel
  wctx.fillStyle = "#94a3b8"; wctx.font = "14px Segoe UI, Arial";
  wctx.fillText("analyzed wheel (motor)", rearX - 70, cy - R - 24);

  // ---- Tracked point P on the tire edge of the rear wheel
  const px = cx + R * Math.cos(angle);
  const py = rearCy + R * Math.sin(angle);

  // Radius line from center to P
  wctx.setLineDash([5, 5]);
  wctx.strokeStyle = "#94a3b8"; wctx.lineWidth = 1.5;
  wctx.beginPath(); wctx.moveTo(cx, rearCy); wctx.lineTo(px, py); wctx.stroke();
  wctx.setLineDash([]);

  // Arrow lengths use a logarithmic display scale so values from 0.1 to
  // 100 000 all fit on screen. A larger value ALWAYS gives a longer
  // arrow (the trend matches the calculation); length is not proportional.
  const res = state.result;
  const arrowLen = (value) => 15 + 19 * Math.log10(1 + value);   // pixels
  const vLen  = res ? arrowLen(res.vt) : 50;
  const acLen = res ? arrowLen(res.ac) : 50;

  // Tangential velocity: perpendicular to the radius (direction of rotation)
  drawArrow(wctx, px, py,
            px - vLen * Math.sin(angle), py + vLen * Math.cos(angle), "#4ade80");

  // Centripetal acceleration: from P toward the center
  drawArrow(wctx, px, py,
            px - acLen * Math.cos(angle), py - acLen * Math.sin(angle), "#fb923c");

  // Point P
  wctx.beginPath(); wctx.arc(px, py, 7, 0, 2 * Math.PI);
  wctx.fillStyle = "#f8fafc"; wctx.fill();
  wctx.fillStyle = "#e2e8f0"; wctx.font = "bold 16px Segoe UI, Arial";
  wctx.fillText("P", px + 10, py - 10);

  // Small readout in the corner
  wctx.fillStyle = "#94a3b8"; wctx.font = "15px Segoe UI, Arial";
  wctx.fillText(`r = ${state.radius} m   N = ${state.rpm} RPM`, 14, 26);
}

/**
 * Animation loop. Called by the browser about 60 times per second.
 * The wheel turns at the REAL angular velocity multiplied by the
 * "slow motion" factor from the slider (otherwise 600 RPM = 10 turns/s
 * would look like a blur).
 */
function animate(timestamp) {
  if (lastFrame !== null && !paused && state.valid) {
    const dt = (timestamp - lastFrame) / 1000;          // seconds since last frame
    const slowFactor = parseFloat($("slow").value);
    const dAngle = state.result.omega * slowFactor * dt; // Δθ = ω · Δt
    angle += dAngle;
    groundOffset += wheelRadiusPx() * dAngle;           // rolling: ground moves back by r·Δθ
  }
  lastFrame = timestamp;
  drawWheel();
  requestAnimationFrame(animate);
}


/* =====================================================================
   SECTION 5 — GRAPH OF θ vs t
   A straight line through the origin; slope = ω.

   PDF ref: p.3, "Minimum product requirements" item 6 (responsive graph)
            and item 7 ("Label ... graph axes with quantities and units":
            axes here are "time t (s)" and "angular displacement θ (rad)").
            p.5, "Rotation with constant angular acceleration" row,
            Δθ = ω₀t + ½αt² with α = 0 gives the straight line Δθ = ωt.
            p.1, section IV lists "displacement-time ... graphs" and
            "angular displacement"; this graph is the rotational version.
   ===================================================================== */

const graphCanvas = $("graphCanvas");
const gctx = graphCanvas.getContext("2d");

function drawGraph() {
  const W = graphCanvas.width, H = graphCanvas.height;
  const pad = { l: 60, r: 20, t: 20, b: 45 };
  gctx.clearRect(0, 0, W, H);
  if (!state.valid) return;

  const tMax = Math.max(state.time, 1);                // x-axis end
  const thMax = state.result.omega * tMax;             // y-axis end
  const X = (t) => pad.l + (t / tMax) * (W - pad.l - pad.r);
  const Y = (th) => H - pad.b - (th / thMax) * (H - pad.t - pad.b);

  // Axes
  gctx.strokeStyle = "#64748b"; gctx.lineWidth = 1.5;
  gctx.beginPath();
  gctx.moveTo(pad.l, pad.t); gctx.lineTo(pad.l, H - pad.b); gctx.lineTo(W - pad.r, H - pad.b);
  gctx.stroke();

  // Tick labels (5 ticks on each axis)
  gctx.fillStyle = "#94a3b8"; gctx.font = "12px Segoe UI, Arial";
  for (let i = 0; i <= 5; i++) {
    const t = (tMax * i) / 5, th = (thMax * i) / 5;
    gctx.fillText(fmt(t, 1), X(t) - 8, H - pad.b + 16);
    gctx.fillText(fmt(th, th >= 10 ? 0 : 2), 6, Y(th) + 4);   // avoid "0, 0, 0" ticks
    gctx.strokeStyle = "#1e293b";
    gctx.beginPath(); gctx.moveTo(pad.l, Y(th)); gctx.lineTo(W - pad.r, Y(th)); gctx.stroke();
  }
  gctx.fillStyle = "#e2e8f0";
  gctx.fillText("time t (s)", W / 2 - 25, H - 8);
  gctx.save(); gctx.translate(14, H / 2 + 40); gctx.rotate(-Math.PI / 2);
  gctx.fillText("angular displacement θ (rad)", 0, 0); gctx.restore();

  // The line θ = ωt
  gctx.strokeStyle = "#22d3ee"; gctx.lineWidth = 3;
  gctx.beginPath(); gctx.moveTo(X(0), Y(0)); gctx.lineTo(X(tMax), Y(thMax)); gctx.stroke();

  // Marker at the entered time
  const mx = X(state.time), my = Y(state.result.theta);
  gctx.fillStyle = "#4ade80";
  gctx.beginPath(); gctx.arc(mx, my, 6, 0, 2 * Math.PI); gctx.fill();
  gctx.fillText(`(${fmt(state.time, 1)} s, ${fmt(state.result.theta, 1)} rad)`,
                Math.min(mx - 50, W - 160), my - 12);
}


/* =====================================================================
   SECTION 6 — TEST PANEL
   The student solves ω, v_t and a_c by hand, types the answers, and
   the program compares them with its own results (±1% tolerance).
   The "Given" values are random and change every time the student
   presses Clear.

   PDF ref: this panel is the team's own feature (from the project idea),
            not a PDF item. It supports p.3, Phase 1 step 4 ("Test at
            least three input sets, compare all relevant numerical outputs
            with manual calculations") and p.6, "Show evidence for three
            input sets" ("Place the comparisons in a small test-results
            panel in your program"). The fixed three-case evidence is in
            SECTION 7.
   ===================================================================== */

// The ±1% tolerance is the developer's choice (not in the PDF). The strict
// 3-decimal comparison required by p.6 is done in SECTION 7.
const TOLERANCE = 0.01;  // 1 % allowed difference

/** The three quantities that are tested. */
const TESTS = [
  { input: "testOmega", key: "omega", answer: "ansOmega", result: "resOmega" },
  { input: "testVt",    key: "vt",    answer: "ansVt",    result: "resVt" },
  { input: "testAc",    key: "ac",    answer: "ansAc",    result: "resAc" }
];

/** Compare one answer with the expected value. */
function isCorrect(userValue, expected) {
  if (expected === 0) return Math.abs(userValue) < 1e-9;
  return Math.abs(userValue - expected) / Math.abs(expected) <= TOLERANCE;
}

/**
 * The problem the student must solve. It is independent from the analyzer
 * inputs above: it starts as a RANDOM problem and gets a new random one
 * every time the student presses "Clear". "Use my analyzer values" copies
 * the values currently typed in the analyzer instead.
 */
const testProblem = { r: 0.12, rpm: 600, t: 5 };   // r in meters

/** Whole random number from min to max (both included). */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Writes the "Given" line of the test panel (same layout as section 5). */
function showTestGiven() {
  $("testGiven").textContent =
    `Given:  r = ${testProblem.r} m,   N = ${testProblem.rpm} RPM,   t = ${testProblem.t} s`;
}

/** Picks clean random values that stay inside the allowed input ranges. */
function newRandomProblem() {
  testProblem.r   = randInt(5, 40) / 100;      // 0.05 m ... 0.40 m (whole centimeters)
  testProblem.rpm = randInt(2, 50) * 30;       // 60 ... 1500 RPM, steps of 30
  testProblem.t   = randInt(1, 10);            // 1 ... 10 s
  showTestGiven();
  resetTestResults();
}

/** Uses the values that are currently valid in the analyzer. */
function useAnalyzerValues() {
  if (!state.valid) { $("testSummary").textContent = "Fix the analyzer inputs first."; return; }
  testProblem.r = state.radius; testProblem.rpm = state.rpm; testProblem.t = state.time;
  TESTS.forEach(t => { $(t.input).value = ""; });
  showTestGiven();
  resetTestResults();
}

function checkAnswers() {
  // The expected values are calculated from the test problem's Given values.
  const expectedAll = analyze(testProblem.r, testProblem.rpm, testProblem.t);

  let correct = 0;
  TESTS.forEach(t => {
    const user = parseFloat($(t.input).value);
    const expected = expectedAll[t.key];
    $(t.answer).textContent = fmt(expected);       // reveal program value

    if (isNaN(user)) {
      $(t.result).textContent = "— enter a number";
      $(t.result).className = "badge";
    } else if (isCorrect(user, expected)) {
      $(t.result).textContent = "✔ Correct";
      $(t.result).className = "badge ok";
      correct++;
    } else {
      $(t.result).textContent = "✘ Check again";
      $(t.result).className = "badge bad";
    }
  });

  $("testSummary").textContent = `Score: ${correct} / ${TESTS.length} correct`;
  $("testSummary").className = "badge " + (correct === TESTS.length ? "ok" : "bad");
}

/** Hides the program answers again (used on a new problem or Clear). */
function resetTestResults() {
  TESTS.forEach(t => {
    $(t.answer).textContent = "hidden";
    $(t.result).textContent = "";
  });
  $("testSummary").textContent = "";
}

/** Clear: empties the answer boxes and gives a NEW random "Given". */
function clearTest() {
  TESTS.forEach(t => { $(t.input).value = ""; });
  newRandomProblem();
}


/* =====================================================================
   SECTION 7 — VALIDATION EVIDENCE (three manual cases + trend checks)
   The "manual" numbers below were worked out by hand on a calculator
   from ω = 2πN/60, v_t = rω, a_c = rω² — they are typed in as fixed
   constants and are NOT produced by the program. The page then runs the
   program's own functions with the same inputs and compares the two at
   the displayed precision (3 decimal places).
   ===================================================================== */

/*
   PDF ref: p.6, "Show evidence for three input sets": "For each case,
            identify the inputs and units, use the correct equation,
            calculate the expected result manually, record the program
            result, and compare them." and "For an analytical calculator,
            results should agree to the displayed precision."
            p.3, "Minimum product requirements" item 10 ("Validate at
            least three input sets using manual Physics calculations;
            show the evidence in the product or video").
            p.6, "Your group must run its own cases and show the actual
            outputs" -> these three cases are the team's own, different
            from the worked example in the PDF.
            p.9, rubric row "Accuracy Testing and Validation" (max 10).
*/
const VALIDATION_CASES = [
  // r (m), N (RPM), and the hand-calculated answers
  { r: 0.12, rpm: 600,  manual: { omega: 62.832,  vt: 7.540,  ac: 473.741  } },
  { r: 0.25, rpm: 300,  manual: { omega: 31.416,  vt: 7.854,  ac: 246.740  } },
  { r: 0.10, rpm: 1200, manual: { omega: 125.664, vt: 12.566, ac: 1579.137 } }
];

/** Two numbers agree at 3 decimal places (half of the last digit). */
function agrees(program, manual) {
  return Math.abs(program - manual) < 0.0005 + 1e-9;
}

/** Fills the validation table, trend checks and manual-calculation box. */
function renderValidation() {
  // ---- Table of the three input sets ----
  let passed = 0;
  const rows = VALIDATION_CASES.map((c, i) => {
    const p = analyze(c.r, c.rpm, 1);               // program result (t not needed)
    const okW = agrees(p.omega, c.manual.omega);
    const okV = agrees(p.vt,    c.manual.vt);
    const okA = agrees(p.ac,    c.manual.ac);
    const all = okW && okV && okA;
    if (all) passed++;
    const cell = (prog, man, ok) =>
      `<td>${man.toFixed(3)}</td><td class="${ok ? "ok" : "bad"}">${prog.toFixed(3)}</td>`;
    return `<tr>
      <td>${i + 1}</td><td>${c.r}</td><td>${c.rpm}</td>
      ${cell(p.omega, c.manual.omega, okW)}
      ${cell(p.vt,    c.manual.vt,    okV)}
      ${cell(p.ac,    c.manual.ac,    okA)}
      <td class="badge ${all ? "ok" : "bad"}">${all ? "✔ Agree" : "✘ Differ"}</td>
      <td><button data-case="${i}">Load</button></td>
    </tr>`;
  });
  $("valBody").innerHTML = rows.join("");
  $("valSummary").textContent =
    `${passed} of ${VALIDATION_CASES.length} input sets agree with the manual calculation.`;
  $("valSummary").className = "badge " + (passed === VALIDATION_CASES.length ? "ok" : "bad");

  // "Load" buttons copy a case into the main inputs (radius in meters).
  $("valBody").querySelectorAll("button[data-case]").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = VALIDATION_CASES[btn.dataset.case];
      $("radiusUnit").value = "m";
      $("radius").value = c.r; $("rpm").value = c.rpm;
      updateAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ---- Trend checks (expected relationships from the physics) ----
  // PDF ref: p.6, directly under the worked-example table: "Expected
  //          trends: doubling radius at fixed RPM doubles v_t and a_c.
  //          Doubling RPM at fixed radius doubles ω and v_t, while a_c
  //          becomes four times as large."
  //          The reference inputs (0.20 m, 60 RPM; 0.40 m; 120 RPM) are
  //          cases 1-3 of that table.
  const a = analyze(0.20, 60, 1);    // reference
  const b = analyze(0.40, 60, 1);    // radius doubled
  const c = analyze(0.20, 120, 1);   // RPM doubled
  const trends = [
    ["Radius × 2 (N fixed): v<sub>t</sub> doubles", 2, b.vt / a.vt],
    ["Radius × 2 (N fixed): a<sub>c</sub> doubles", 2, b.ac / a.ac],
    ["Radius × 2 (N fixed): ω unchanged",           1, b.omega / a.omega],
    ["RPM × 2 (r fixed): ω doubles",                2, c.omega / a.omega],
    ["RPM × 2 (r fixed): v<sub>t</sub> doubles",    2, c.vt / a.vt],
    ["RPM × 2 (r fixed): a<sub>c</sub> becomes 4×", 4, c.ac / a.ac]
  ];
  $("trendBody").innerHTML = trends.map(([text, expected, got]) => {
    const ok = Math.abs(got - expected) < 1e-9;
    return `<tr><td>${text}</td><td>${expected}</td>
            <td class="${ok ? "ok" : "bad"}">${got.toFixed(3)}</td>
            <td class="badge ${ok ? "ok" : "bad"}">${ok ? "✔" : "✘"}</td></tr>`;
  }).join("");

  // ---- Program output shown next to the written manual calculation ----
  // PDF ref: p.7, Phase 2 table, row "4 Physics and coding integration":
  //          "Show at least one complete manual calculation and compare it
  //          with the matching program result." (same layout as the
  //          Case 1 manual check on p.6).
  const m = analyze(0.12, 600, 1);
  $("manualProgram").textContent =
    `Program output for r = 0.12 m, N = 600 RPM:  ω = ${m.omega.toFixed(3)} rad/s,  ` +
    `v_t = ${m.vt.toFixed(3)} m/s,  a_c = ${m.ac.toFixed(3)} m/s²`;
}


/* =====================================================================
   SECTION 8 — START-UP: connect buttons and inputs to the functions

   PDF ref: p.3, "Minimum product requirements" item 1 ("Run reliably")
            and item 4 (inputs the user can change); p.4, row "Smart Wheel
            Analyzer" (controls "Adjust radius and RPM"). The preset
            buttons and Reset button are the developer's own additions.
   ===================================================================== */

// Recalculate whenever the user types in an input box or changes the unit.
["radius", "rpm", "time"].forEach(id => $(id).addEventListener("input", updateAll));
$("radiusUnit").addEventListener("change", updateAll);

// Calculate button (same as typing; useful for the user's confidence).
$("calcBtn").addEventListener("click", updateAll);

// Reset button: back to default values.
$("resetBtn").addEventListener("click", () => {
  $("radiusUnit").value = "m";
  $("radius").value = 0.12; $("rpm").value = 600; $("time").value = 5;
  clearTest(); updateAll();
});

// Preset buttons store "radius,rpm,time" in data-preset (radius in meters).
document.querySelectorAll("[data-preset]").forEach(btn => {
  btn.addEventListener("click", () => {
    const [r, n, t] = btn.dataset.preset.split(",");
    $("radiusUnit").value = "m";
    $("radius").value = r; $("rpm").value = n; $("time").value = t;
    updateAll();
  });
});

// Slow-motion slider label.
function updateSlowLabel() {
  const f = parseFloat($("slow").value);
  $("slowLabel").textContent = `Wheel is drawn at ${Math.round(f * 100)}% of real speed.`;
}
$("slow").addEventListener("input", updateSlowLabel);

// Pause / resume animation.
$("pauseBtn").addEventListener("click", () => {
  paused = !paused;
  $("pauseBtn").textContent = paused ? "▶ Resume" : "⏸ Pause";
});

// Test panel buttons.
$("checkBtn").addEventListener("click", checkAnswers);
$("clearTestBtn").addEventListener("click", clearTest);
$("useValuesBtn").addEventListener("click", useAnalyzerValues);

// Optional start values from the page address, for example
//   index.html?r=0.12&rpm=600&t=5      or      index.html?r=12&unit=cm&rpm=600
// presentation.html uses this to load the demo cases. Normal use is unchanged.
(function applyUrlParams() {
  const p = new URLSearchParams(window.location.search);
  if (p.has("unit") && RADIUS_UNITS[p.get("unit")]) $("radiusUnit").value = p.get("unit");
  if (p.has("r"))   $("radius").value = p.get("r");
  if (p.has("rpm")) $("rpm").value    = p.get("rpm");
  if (p.has("t"))   $("time").value   = p.get("t");
  // compact=1 hides the long "How to use" card (used inside the slide frame).
  if (p.get("compact") === "1") document.body.classList.add("compact");
})();

// Go!
newRandomProblem();      // first random "Given" for the test panel
updateSlowLabel();
renderValidation();
updateAll();
requestAnimationFrame(animate);

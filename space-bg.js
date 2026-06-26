(function () {
  const canvas = document.getElementById('spaceCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); rebuildScene(); });

  // ─── RNG seeded so asteroids look consistent across frames ───
  function seededRand(seed) {
    let s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // ─── STARS ───────────────────────────────────────────────────
  let stars = [];
  function buildStars() {
    stars = [];
    const rand = seededRand(42);
    for (let i = 0; i < 420; i++) {
      const hue = rand() < 0.6 ? 0 : rand() < 0.5 ? 210 : 260;
      stars.push({
        x: rand(), y: rand(),
        r: rand() * 1.6 + 0.2,
        phase: rand() * Math.PI * 2,
        speed: rand() * 0.6 + 0.2,
        color: `hsl(${hue},${Math.floor(rand() * 40)}%,${Math.floor(85 + rand() * 15)}%)`,
        bright: rand() > 0.85
      });
    }
  }

  function drawStars(t) {
    stars.forEach(s => {
      const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.bright) {
        // 4-point star spike
        ctx.globalAlpha = pulse * 0.5;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.5;
        const cx = s.x * W, cy = s.y * H, len = s.r * 4;
        ctx.beginPath();
        ctx.moveTo(cx - len, cy); ctx.lineTo(cx + len, cy);
        ctx.moveTo(cx, cy - len); ctx.lineTo(cx, cy + len);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // ─── NEBULA / BACKGROUND ─────────────────────────────────────
  function drawBackground() {
    // Deep space — matches reference dark blue-grey palette
    const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
    bg.addColorStop(0, '#050a18');
    bg.addColorStop(0.35, '#071428');
    bg.addColorStop(0.7, '#060c20');
    bg.addColorStop(1, '#020610');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Bright blue nebula cloud — upper-centre, matches reference
    const neb1 = ctx.createRadialGradient(W * 0.38, H * 0.28, 0, W * 0.38, H * 0.28, W * 0.42);
    neb1.addColorStop(0, 'rgba(60,110,210,0.18)');
    neb1.addColorStop(0.3, 'rgba(40,80,180,0.12)');
    neb1.addColorStop(0.6, 'rgba(20,50,140,0.07)');
    neb1.addColorStop(1, 'transparent');
    ctx.fillStyle = neb1;
    ctx.beginPath();
    ctx.ellipse(W * 0.38, H * 0.28, W * 0.42, H * 0.35, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Orange/golden nebula cloud — upper-right near rocky planet (matches reference)
    const neb2 = ctx.createRadialGradient(W * 0.82, H * 0.22, 0, W * 0.82, H * 0.22, W * 0.28);
    neb2.addColorStop(0, 'rgba(200,110,40,0.16)');
    neb2.addColorStop(0.4, 'rgba(150,70,20,0.1)');
    neb2.addColorStop(1, 'transparent');
    ctx.fillStyle = neb2;
    ctx.beginPath();
    ctx.ellipse(W * 0.82, H * 0.22, W * 0.28, H * 0.22, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Soft left-side blue tint
    const neb3 = ctx.createRadialGradient(W * 0.1, H * 0.5, 0, W * 0.1, H * 0.5, W * 0.32);
    neb3.addColorStop(0, 'rgba(30,70,160,0.1)');
    neb3.addColorStop(1, 'transparent');
    ctx.fillStyle = neb3;
    ctx.beginPath();
    ctx.arc(W * 0.1, H * 0.5, W * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Space dust — tiny grain pass
    ctx.save();
    ctx.globalAlpha = 0.04;
    const dust = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.7);
    dust.addColorStop(0, '#8ab4ff');
    dust.addColorStop(0.5, '#5080c0');
    dust.addColorStop(1, 'transparent');
    ctx.fillStyle = dust;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ─── PLANETS ─────────────────────────────────────────────────
  // Planet 1: Large ringed blue-grey planet, top-left (partially cropped like reference)
  function drawPlanetLeft(t) {
    const px = W * 0.12, py = H * 0.1;
    const pr = Math.min(W, H) * 0.22;

    ctx.save();
    // Planet body
    const pg = ctx.createRadialGradient(px - pr * 0.25, py - pr * 0.22, pr * 0.05, px, py, pr);
    pg.addColorStop(0, '#c0cfe8');
    pg.addColorStop(0.18, '#8aaad8');
    pg.addColorStop(0.45, '#4e7ab8');
    pg.addColorStop(0.72, '#2a5090');
    pg.addColorStop(0.88, '#162c60');
    pg.addColorStop(1, '#0a1530');
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = pg;
    ctx.fill();

    // Surface band details
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.12;
    for (let band = -3; band <= 3; band++) {
      ctx.fillStyle = band % 2 === 0 ? '#aaccff' : '#2244aa';
      ctx.fillRect(px - pr, py + band * pr * 0.18, pr * 2, pr * 0.12);
    }
    ctx.restore();

    // Ring system (elliptical, tilted — matches reference)
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1, 0.22);
    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, pr * 1.85, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,210,255,0.28)';
    ctx.lineWidth = pr * 0.32;
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, pr * 1.48, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(140,180,240,0.18)';
    ctx.lineWidth = pr * 0.12;
    ctx.stroke();
    ctx.restore();

    // Atmosphere glow
    const atm = ctx.createRadialGradient(px, py, pr * 0.88, px, py, pr * 1.22);
    atm.addColorStop(0, 'rgba(80,140,240,0.22)');
    atm.addColorStop(0.5, 'rgba(60,100,200,0.08)');
    atm.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, pr * 1.22, 0, Math.PI * 2);
    ctx.fillStyle = atm;
    ctx.fill();

    // Very slow rotation shimmer (tiny surface highlight moves)
    const shimX = px - pr * 0.3 + Math.sin(t * 0.04) * pr * 0.05;
    const shimY = py - pr * 0.25 + Math.cos(t * 0.04) * pr * 0.03;
    const shim = ctx.createRadialGradient(shimX, shimY, 0, shimX, shimY, pr * 0.5);
    shim.addColorStop(0, 'rgba(255,255,255,0.07)');
    shim.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = shim;
    ctx.fill();

    ctx.restore();
  }

  // Planet 2: Small moon, left of main planet (matches reference — a small grey orb)
  function drawMoonLeft() {
    const mx = W * 0.11, my = H * 0.36;
    const mr = Math.min(W, H) * 0.06;
    ctx.save();
    const mg = ctx.createRadialGradient(mx - mr * 0.25, my - mr * 0.2, mr * 0.05, mx, my, mr);
    mg.addColorStop(0, '#b0b8c8');
    mg.addColorStop(0.5, '#707888');
    mg.addColorStop(1, '#202530');
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fillStyle = mg;
    ctx.fill();
    ctx.restore();
  }

  // Planet 3: Rocky orange-brown planet, top-right (with lava-glow patches — matches reference)
  function drawPlanetRight(t) {
    const px = W * 0.9, py = H * 0.12;
    const pr = Math.min(W, H) * 0.16;
    ctx.save();
    const pg = ctx.createRadialGradient(px - pr * 0.2, py - pr * 0.2, pr * 0.05, px, py, pr);
    pg.addColorStop(0, '#c87840');
    pg.addColorStop(0.3, '#9a5028');
    pg.addColorStop(0.6, '#6a3010');
    pg.addColorStop(0.85, '#3c1808');
    pg.addColorStop(1, '#1a0808');
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = pg;
    ctx.fill();

    // Lava/fire patches (top-right side, matches reference bright patches)
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.clip();
    const lavaGlow = ctx.createRadialGradient(px + pr * 0.35, py - pr * 0.35, 0, px + pr * 0.35, py - pr * 0.35, pr * 0.5);
    lavaGlow.addColorStop(0, 'rgba(255,180,60,0.55)');
    lavaGlow.addColorStop(0.4, 'rgba(220,100,20,0.3)');
    lavaGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lavaGlow;
    ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    ctx.restore();

    // Atmosphere glow (amber-orange)
    const atm = ctx.createRadialGradient(px, py, pr * 0.88, px, py, pr * 1.18);
    atm.addColorStop(0, 'rgba(220,110,30,0.18)');
    atm.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, pr * 1.18, 0, Math.PI * 2);
    ctx.fillStyle = atm;
    ctx.fill();

    // Slow surface shimmer
    const shimX = px - pr * 0.25 + Math.sin(t * 0.05 + 1) * pr * 0.06;
    const shimY = py - pr * 0.22 + Math.cos(t * 0.05 + 1) * pr * 0.04;
    const shim = ctx.createRadialGradient(shimX, shimY, 0, shimX, shimY, pr * 0.45);
    shim.addColorStop(0, 'rgba(255,200,100,0.08)');
    shim.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = shim;
    ctx.fill();

    ctx.restore();
  }

  // Small planet, bottom-right area (reference has a small sphere lower right)
  function drawPlanetSmall() {
    const px = W * 0.88, py = H * 0.82;
    const pr = Math.min(W, H) * 0.035;
    ctx.save();
    const pg = ctx.createRadialGradient(px - pr * 0.2, py - pr * 0.2, 0, px, py, pr);
    pg.addColorStop(0, '#b0c8e0');
    pg.addColorStop(0.6, '#607090');
    pg.addColorStop(1, '#202838');
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.restore();
  }

  // ─── ASTEROIDS ────────────────────────────────────────────────
  // Exactly matched to reference: dense cluster bottom-left and scattered mid-scene
  let asteroids = [];

  function buildAsteroids() {
    const rand = seededRand(99);
    const clusters = [
      // Bottom-left large group (dominant in reference)
      ...Array.from({ length: 14 }, (_, i) => ({
        bx: 0.02 + rand() * 0.28, by: 0.62 + rand() * 0.38,
        size: (0.018 + rand() * 0.048) * Math.min(window.innerWidth, window.innerHeight),
        dark: rand() > 0.5
      })),
      // Mid-left floating rocks
      ...Array.from({ length: 6 }, () => ({
        bx: 0.03 + rand() * 0.18, by: 0.4 + rand() * 0.24,
        size: (0.01 + rand() * 0.028) * Math.min(window.innerWidth, window.innerHeight),
        dark: rand() > 0.4
      })),
      // Mid-right side
      ...Array.from({ length: 5 }, () => ({
        bx: 0.7 + rand() * 0.28, by: 0.4 + rand() * 0.3,
        size: (0.012 + rand() * 0.026) * Math.min(window.innerWidth, window.innerHeight),
        dark: rand() > 0.4
      })),
      // Scattered across mid-lower area
      ...Array.from({ length: 8 }, () => ({
        bx: 0.3 + rand() * 0.45, by: 0.55 + rand() * 0.4,
        size: (0.008 + rand() * 0.022) * Math.min(window.innerWidth, window.innerHeight),
        dark: rand() > 0.4
      })),
      // Upper-mid small rocks
      ...Array.from({ length: 5 }, () => ({
        bx: 0.15 + rand() * 0.6, by: 0.1 + rand() * 0.3,
        size: (0.006 + rand() * 0.016) * Math.min(window.innerWidth, window.innerHeight),
        dark: rand() > 0.4
      })),
    ];

    const shapeRand = seededRand(77);
    asteroids = clusters.map((c, idx) => {
      const pts = 7 + Math.floor(shapeRand() * 4);
      const verts = [];
      for (let i = 0; i < pts; i++) {
        const ang = (i / pts) * Math.PI * 2;
        const r = c.size * (0.65 + shapeRand() * 0.45);
        verts.push({ a: ang, r });
      }
      return {
        bx: c.bx, by: c.by, size: c.size, verts,
        dark: c.dark,
        orbitR: 0.003 + shapeRand() * 0.012,
        orbitSpeed: (shapeRand() * 0.3 + 0.05) * (shapeRand() > 0.5 ? 1 : -1),
        orbitPhase: shapeRand() * Math.PI * 2,
        rotSpeed: (shapeRand() * 0.4 + 0.05) * (shapeRand() > 0.5 ? 1 : -1),
        rotPhase: shapeRand() * Math.PI * 2,
      };
    });
  }

  function drawAsteroids(t) {
    asteroids.forEach(a => {
      // Orbital drift (very slow)
      const ox = Math.sin(t * a.orbitSpeed + a.orbitPhase) * a.orbitR * W;
      const oy = Math.cos(t * a.orbitSpeed * 0.7 + a.orbitPhase) * a.orbitR * H;
      const ax = a.bx * W + ox;
      const ay = a.by * H + oy;
      const rot = t * a.rotSpeed * 0.15 + a.rotPhase;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(rot);

      ctx.beginPath();
      a.verts.forEach((v, i) => {
        const x = Math.cos(v.a) * v.r;
        const y = Math.sin(v.a) * v.r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();

      // Gradient shading for 3D look
      const lightX = -a.size * 0.35, lightY = -a.size * 0.3;
      const ag = ctx.createRadialGradient(lightX, lightY, 0, 0, 0, a.size * 1.1);
      if (a.dark) {
        ag.addColorStop(0, '#7a6a58');
        ag.addColorStop(0.35, '#5a4a38');
        ag.addColorStop(0.7, '#3c2e20');
        ag.addColorStop(1, '#1c1410');
      } else {
        ag.addColorStop(0, '#9a8870');
        ag.addColorStop(0.35, '#706050');
        ag.addColorStop(0.7, '#4a3c2c');
        ag.addColorStop(1, '#241c14');
      }
      ctx.fillStyle = ag;
      ctx.fill();

      // Subtle dark edge
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Small highlight on lit face
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#d0c0a8';
      ctx.beginPath();
      ctx.arc(lightX * 0.5, lightY * 0.5, a.size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    });
  }

  // ─── SMOKE PARTICLES ─────────────────────────────────────────
  const smoke = [];

  function spawnSmoke(wx, wy) {
    if (smoke.length > 80) smoke.shift();
    smoke.push({
      x: wx, y: wy,
      vx: (Math.random() - 0.6) * 0.25,
      vy: -(Math.random() * 1.4 + 0.6),
      r: 8 + Math.random() * 10,
      life: 1, decay: 0.007 + Math.random() * 0.006,
      gray: 160 + Math.floor(Math.random() * 60),
    });
  }

  function updateSmoke() {
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.x += p.vx; p.y += p.vy;
      p.r += 0.55;
      p.life -= p.decay;
      if (p.life <= 0) smoke.splice(i, 1);
    }
  }

  function drawSmoke() {
    smoke.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life * 0.38;
      const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      const g = p.gray;
      sg.addColorStop(0, `rgba(${g},${g},${g + 10},0.7)`);
      sg.addColorStop(0.5, `rgba(${g - 20},${g - 20},${g - 10},0.35)`);
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ─── TRAIN ───────────────────────────────────────────────────
  // Matches reference: red locomotive right side with chimney top,
  // trailing cars going left and slightly down, train faces right
  let trainProgress = 0.18; // 0..1 across screen + off

  function drawTrain(t) {
    // Train moves slowly left-to-right, looping (like it's flying past)
    trainProgress += 0.00008;
    if (trainProgress > 1.25) trainProgress = -0.22;

    // Base position: train centred around 55% down, going from left to right
    // Slight perspective angle (going slightly toward upper-right like reference)
    const tAngle = -0.055; // gentle upward tilt
    const scale = Math.min(W, H) / 900; // responsive scale

    // Train centre X
    const tx = trainProgress * (W + 800) - 400 + W * 0.05;
    const ty = H * 0.58;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(tAngle);
    ctx.scale(scale, scale);

    // ── CARS (draw back to front) ──
    const carW = 200, carH = 72, carGap = 6;
    const numCars = 5;

    for (let c = numCars - 1; c >= 0; c--) {
      const cx = -(c + 1) * (carW + carGap) - 60;
      drawCar(cx, carH, c, numCars, t);
    }

    // ── LOCOMOTIVE ──
    drawLocomotive(0, t);

    ctx.restore();

    // Headlight beam effect
    const beamX = tx + Math.cos(tAngle) * 320 * scale;
    const beamY = ty + Math.sin(tAngle) * 320 * scale;
    const beamG = ctx.createRadialGradient(beamX, beamY, 0, beamX, beamY, 180 * scale);
    beamG.addColorStop(0, 'rgba(255,230,120,0.12)');
    beamG.addColorStop(0.4, 'rgba(255,200,80,0.05)');
    beamG.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.arc(beamX, beamY, 180 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Spawn smoke from chimney top
    const chimneyX = tx + Math.cos(tAngle) * (-30) * scale;
    const chimneyY = ty + Math.sin(tAngle) * (-30) * scale - 95 * scale;
    if (Math.random() < 0.5) spawnSmoke(chimneyX + (Math.random() - 0.5) * 8 * scale, chimneyY);
  }

  function drawCar(cx, carH, carIdx, numCars, t) {
    const carW = 200;

    // Shadow under car
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx + carW / 2, carH / 2 + 18, carW * 0.45, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Car body — dark red-brown matching reference
    const bg = ctx.createLinearGradient(cx, -carH / 2, cx, carH / 2);
    bg.addColorStop(0, '#6a1010');
    bg.addColorStop(0.25, '#7a1414');
    bg.addColorStop(0.55, '#5a0e0e');
    bg.addColorStop(0.8, '#3c0a0a');
    bg.addColorStop(1, '#200606');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(cx, -carH / 2, carW, carH, [2, 2, 3, 3]);
    ctx.fill();

    // Car body edge highlight
    ctx.strokeStyle = '#8a2020';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx, -carH / 2, carW, carH, [2, 2, 3, 3]);
    ctx.stroke();

    // Darker roof edge
    ctx.fillStyle = '#2a0808';
    ctx.fillRect(cx, -carH / 2, carW, 8);

    // Windows — warm golden light, flickering slightly
    const numWin = Math.floor(carW / 36);
    for (let w = 0; w < numWin; w++) {
      const wx = cx + 14 + w * 36;
      const flicker = 0.85 + 0.15 * Math.sin(t * (2 + w * 0.7) + carIdx * 1.3 + w);
      const wg = ctx.createRadialGradient(wx + 9, -carH * 0.12, 0, wx + 9, -carH * 0.12, 14);
      wg.addColorStop(0, `rgba(255,${Math.floor(195 * flicker)},${Math.floor(60 * flicker)},0.95)`);
      wg.addColorStop(0.5, `rgba(220,${Math.floor(140 * flicker)},20,0.7)`);
      wg.addColorStop(1, 'rgba(140,60,0,0)');
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.roundRect(wx, -carH * 0.32, 18, 22, 2);
      ctx.fill();
      // Window frame
      ctx.strokeStyle = 'rgba(60,20,0,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(wx, -carH * 0.32, 18, 22, 2);
      ctx.stroke();
    }

    // Bottom detail / running board
    ctx.fillStyle = '#180404';
    ctx.fillRect(cx + 10, carH / 2 - 8, carW - 20, 8);

    // Wheels (stylised circles)
    const wheelY = carH / 2 + 5;
    [cx + 28, cx + carW - 28].forEach(wx => {
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(wx, wheelY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Wheel spoke
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wx - 10, wheelY); ctx.lineTo(wx + 10, wheelY);
      ctx.moveTo(wx, wheelY - 10); ctx.lineTo(wx, wheelY + 10);
      ctx.stroke();
    });

    // Inter-car coupler
    if (carIdx < numCars - 1) {
      ctx.fillStyle = '#2a1008';
      ctx.fillRect(cx + carW, -5, carGap + 2, 10);
    }
  }

  function drawLocomotive(x, t) {
    // Reference: big black circular front boiler face, red body, chimney on top

    const bodyW = 260, bodyH = 95, bodyX = x;

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyW * 0.5, bodyH / 2 + 20, bodyW * 0.45, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── Main body ──
    const locG = ctx.createLinearGradient(bodyX, -bodyH / 2, bodyX, bodyH / 2);
    locG.addColorStop(0, '#7a1212');
    locG.addColorStop(0.3, '#8e1818');
    locG.addColorStop(0.62, '#660e0e');
    locG.addColorStop(0.85, '#3e0808');
    locG.addColorStop(1, '#200606');
    ctx.fillStyle = locG;
    ctx.beginPath();
    ctx.roundRect(bodyX, -bodyH / 2, bodyW, bodyH, [4, 30, 10, 4]);
    ctx.fill();
    ctx.strokeStyle = '#aa2222';
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── Boiler dome (red dome on top of body) ──
    const domeX = bodyX + bodyW * 0.35, domeY = -bodyH / 2;
    const domeG = ctx.createRadialGradient(domeX - 12, domeY - 10, 2, domeX, domeY, 34);
    domeG.addColorStop(0, '#c03030');
    domeG.addColorStop(0.5, '#8a1515');
    domeG.addColorStop(1, '#4a0a0a');
    ctx.fillStyle = domeG;
    ctx.beginPath();
    ctx.ellipse(domeX, domeY, 34, 20, 0, Math.PI, 0);
    ctx.fill();

    // Dome cap
    ctx.fillStyle = '#d4a030';
    ctx.beginPath();
    ctx.arc(domeX, domeY - 18, 7, 0, Math.PI * 2);
    ctx.fill();

    // ── Chimney (stovepipe, on top near left of body) ──
    const chX = bodyX + 55, chTop = -bodyH / 2 - 62;
    ctx.fillStyle = '#111';
    ctx.fillRect(chX - 10, chTop, 20, 62);
    // Chimney top flare
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(chX - 15, chTop, 30, 10);
    // Chimney gold trim
    ctx.fillStyle = '#c08020';
    ctx.fillRect(chX - 14, chTop + 8, 28, 4);

    // ── Big round boiler face (right side, matches reference) ──
    const bfX = bodyX + bodyW + 20, bfY = 0;
    const bfR = 58;
    const bfG = ctx.createRadialGradient(bfX - 18, bfY - 16, 4, bfX, bfY, bfR);
    bfG.addColorStop(0, '#383838');
    bfG.addColorStop(0.3, '#222');
    bfG.addColorStop(0.7, '#141414');
    bfG.addColorStop(1, '#080808');
    ctx.beginPath();
    ctx.arc(bfX, bfY, bfR, 0, Math.PI * 2);
    ctx.fillStyle = bfG;
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Boiler face rivets
    for (let ri = 0; ri < 8; ri++) {
      const ra = (ri / 8) * Math.PI * 2;
      const rx = bfX + Math.cos(ra) * (bfR - 10), ry = bfY + Math.sin(ra) * (bfR - 10);
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();
    }

    // ── Hogwarts banner plaque ──
    ctx.fillStyle = '#8a0000';
    ctx.beginPath();
    ctx.roundRect(bfX - 42, bfY - bfR + 6, 84, 36, 4);
    ctx.fill();
    ctx.strokeStyle = '#d4a020';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd040';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOGWARTS', bfX, bfY - bfR + 22);
    ctx.font = 'bold 10px serif';
    ctx.fillText('EXPRESS', bfX, bfY - bfR + 35);
    ctx.textAlign = 'left';

    // ── 5972 number ──
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('5972', bfX, bfY + 8);
    ctx.textAlign = 'left';

    // ── Headlight (main, glowing) ──
    const hlX = bfX + bfR - 8, hlY = bfY + 16;
    const hlG = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, 22);
    const hlFlick = 0.88 + 0.12 * Math.sin(t * 4.5);
    hlG.addColorStop(0, `rgba(255,${Math.floor(240 * hlFlick)},${Math.floor(160 * hlFlick)},1)`);
    hlG.addColorStop(0.4, `rgba(255,200,80,0.8)`);
    hlG.addColorStop(1, 'transparent');
    ctx.fillStyle = hlG;
    ctx.beginPath();
    ctx.arc(hlX, hlY, 22, 0, Math.PI * 2);
    ctx.fill();

    // ── Second small light lower ──
    const hl2X = bfX + bfR - 5, hl2Y = bfY + 40;
    const hl2G = ctx.createRadialGradient(hl2X, hl2Y, 0, hl2X, hl2Y, 14);
    hl2G.addColorStop(0, 'rgba(255,230,150,0.9)');
    hl2G.addColorStop(1, 'transparent');
    ctx.fillStyle = hl2G;
    ctx.beginPath();
    ctx.arc(hl2X, hl2Y, 14, 0, Math.PI * 2);
    ctx.fill();

    // ── Cow-catcher / front buffer ──
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(bfX + bfR - 4, bodyH / 2 - 5);
    ctx.lineTo(bfX + bfR + 40, bodyH / 2 + 25);
    ctx.lineTo(bfX + bfR + 40, bodyH / 2 + 38);
    ctx.lineTo(bfX + bfR - 4, bodyH / 2 + 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Connecting rods (animated) ──
    const rodPhase = t * 2.5;
    const rod1x = bodyX + 50 + Math.cos(rodPhase) * 8;
    const rod1y = bodyH / 2 + 28 + Math.sin(rodPhase) * 8;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(bodyX + 50, bodyH / 2 + 28);
    ctx.lineTo(rod1x, rod1y);
    ctx.stroke();

    // ── Locomotive wheels (large) ──
    const mainWheelY = bodyH / 2 + 28;
    [[bodyX + 50, 38], [bodyX + 130, 32], [bodyX + 210, 28]].forEach(([wx, wr], wi) => {
      // Wheel rotation
      const wRot = t * 1.8 * (wi === 0 ? 1.15 : 1);
      ctx.save();
      ctx.translate(wx, mainWheelY);
      ctx.rotate(wRot);
      // Outer rim
      ctx.fillStyle = '#0c0c0c';
      ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 2.5; ctx.stroke();
      // Spokes (4)
      ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2;
      for (let sp = 0; sp < 4; sp++) {
        const sa = (sp / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 5, Math.sin(sa) * 5);
        ctx.lineTo(Math.cos(sa) * (wr - 4), Math.sin(sa) * (wr - 4));
        ctx.stroke();
      }
      // Hub
      ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // ── Steam whistle (tiny) ──
    ctx.fillStyle = '#d4a030';
    ctx.fillRect(bodyX + 80, -bodyH / 2 - 12, 6, 12);
  }

  // ─── SCENE REBUILD ───────────────────────────────────────────
  function rebuildScene() { buildStars(); buildAsteroids(); }

  // ─── MAIN LOOP ───────────────────────────────────────────────
  function animate(ts) {
    const t = ts / 1000;
    ctx.clearRect(0, 0, W, H);

    drawBackground();
    drawStars(t);
    drawPlanetLeft(t);
    drawMoonLeft();
    drawPlanetRight(t);
    drawPlanetSmall();
    drawAsteroids(t);
    updateSmoke();
    drawSmoke();
    drawTrain(t);

    requestAnimationFrame(animate);
  }

  // ─── INIT ─────────────────────────────────────────────────────
  buildStars();
  buildAsteroids();
  requestAnimationFrame(animate);
})();
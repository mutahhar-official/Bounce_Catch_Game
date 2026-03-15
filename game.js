// ===================================================
//  BOUNCE CATCH — game.js
// ===================================================

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// ===== CANVAS RESIZE =====
function resizeCanvas() {
  canvas.width  = window.innerWidth  > 420 ? 420 : window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

// ===== GAME STATE =====
let gameState   = 'start';
let score       = 0;
let lapScores   = [0, 0, 0];
let currentLap  = 0;
let streak      = 1;
let animId      = null;
let particles   = [];
let trailPoints = [];
let ball        = {};
let slider      = {};

// ===== INIT BALL =====
function initBall(lapIndex) {
  const baseSpeed = 4 + lapIndex * 1.5;
  ball = {
    x:         canvas.width  * 0.4,
    y:         canvas.height * 0.2,
    r:         Math.min(canvas.width, canvas.height) * 0.04,
    vx:        (Math.random() < 0.5 ? 1 : -1) * (baseSpeed + Math.random()),
    vy:        baseSpeed * 0.5,
    hue:       180,
    speedMult: 1,
  };
}

// ===== INIT SLIDER =====
function initSlider() {
  const w = canvas.width * 0.30;
  slider = {
    x:           canvas.width / 2 - w / 2,
    y:           canvas.height - 80,
    w:           w,
    h:           14,
    dragging:    false,
    dragOffsetX: 0,
    glowAnim:    0,
  };
}

// ===== INPUT =====
function getClientX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function toCanvasX(clientX) {
  const rect = canvas.getBoundingClientRect();
  return clientX - rect.left;
}

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (gameState !== 'playing') return;
  onPointerDown(toCanvasX(getClientX(e)));
}, { passive: false });

canvas.addEventListener('mousedown', e => {
  if (gameState !== 'playing') return;
  onPointerDown(toCanvasX(e.clientX));
});

window.addEventListener('touchmove', e => {
  e.preventDefault();
  if (gameState !== 'playing' || !slider.dragging) return;
  onPointerMove(toCanvasX(getClientX(e)));
}, { passive: false });

window.addEventListener('mousemove', e => {
  if (gameState !== 'playing' || !slider.dragging) return;
  onPointerMove(toCanvasX(e.clientX));
});

window.addEventListener('touchend',  () => { slider.dragging = false; });
window.addEventListener('mouseup',   () => { slider.dragging = false; });

function onPointerDown(x) {
  if (x >= slider.x - 30 && x <= slider.x + slider.w + 30) {
    slider.dragging    = true;
    slider.dragOffsetX = x - (slider.x + slider.w / 2);
  } else {
    slider.dragging    = true;
    slider.dragOffsetX = 0;
    slider.x = clamp(x - slider.w / 2, 0, canvas.width - slider.w);
  }
}

function onPointerMove(x) {
  slider.x = clamp(x - slider.dragOffsetX - slider.w / 2, 0, canvas.width - slider.w);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ===== PARTICLES =====
function spawnParticles(x, y, color, count) {
  count = count || 12;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      life:  1,
      decay: 0.04 + Math.random() * 0.04,
      r:     2 + Math.random() * 3,
      color: color,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.15;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle   = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ===== TRAIL =====
function updateTrail() {
  trailPoints.unshift({ x: ball.x, y: ball.y, life: 1 });
  if (trailPoints.length > 16) trailPoints.pop();
  for (let i = 0; i < trailPoints.length; i++) trailPoints[i].life -= 0.065;
}

function drawTrail() {
  for (let i = 0; i < trailPoints.length; i++) {
    const t = trailPoints[i];
    if (t.life <= 0) continue;
    ctx.save();
    ctx.globalAlpha = t.life * 0.3;
    ctx.beginPath();
    ctx.arc(t.x, t.y, ball.r * t.life * 0.75, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(' + ball.hue + ', 100%, 60%)';
    ctx.fill();
    ctx.restore();
  }
}

// ===== DRAW BACKGROUND =====
function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = 'rgba(0,245,255,0.04)';
  ctx.lineWidth   = 1;
  for (let x = 0; x <= canvas.width;  x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  ctx.restore();

  const gz = ctx.createLinearGradient(0, canvas.height - 70, 0, canvas.height);
  gz.addColorStop(0, 'rgba(255,0,128,0)');
  gz.addColorStop(1, 'rgba(255,0,128,0.10)');
  ctx.fillStyle = gz;
  ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
}

// ===== DRAW BALL =====
function drawBall() {
  ctx.save();
  ctx.translate(ball.x, ball.y);

  const glow = ctx.createRadialGradient(0, 0, ball.r * 0.4, 0, 0, ball.r * 2.6);
  glow.addColorStop(0, 'hsla(' + ball.hue + ',100%,60%,0.35)');
  glow.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(0, 0, ball.r * 2.6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  const body = ctx.createRadialGradient(-ball.r * 0.3, -ball.r * 0.3, 0, 0, 0, ball.r);
  body.addColorStop(0,   '#ffffff');
  body.addColorStop(0.3, 'hsl(' + ball.hue + ',100%,65%)');
  body.addColorStop(1,   'hsl(' + (ball.hue + 40) + ',80%,22%)');
  ctx.beginPath();
  ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
  ctx.fillStyle   = body;
  ctx.shadowColor = 'hsl(' + ball.hue + ',100%,60%)';
  ctx.shadowBlur  = 22;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-ball.r * 0.3, -ball.r * 0.35, ball.r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle  = 'rgba(255,255,255,0.75)';
  ctx.shadowBlur = 0;
  ctx.fill();

  ctx.restore();
}

// ===== DRAW SLIDER =====
function drawSlider() {
  slider.glowAnim = (slider.glowAnim + 0.08) % (Math.PI * 2);
  const gp = 0.65 + 0.35 * Math.sin(slider.glowAnim);

  ctx.save();

  const ag = ctx.createLinearGradient(slider.x, 0, slider.x + slider.w, 0);
  ag.addColorStop(0,   'rgba(0,245,255,0)');
  ag.addColorStop(0.5, 'rgba(0,245,255,' + (0.18 * gp) + ')');
  ag.addColorStop(1,   'rgba(0,245,255,0)');
  ctx.fillStyle = ag;
  ctx.fillRect(slider.x, slider.y - 10, slider.w, slider.h + 20);

  const rnd = slider.h / 2;
  ctx.beginPath();
  ctx.roundRect(slider.x, slider.y, slider.w, slider.h, rnd);
  const bg = ctx.createLinearGradient(slider.x, 0, slider.x + slider.w, 0);
  bg.addColorStop(0,   'rgba(0,245,255,' + (0.25 * gp) + ')');
  bg.addColorStop(0.5, 'rgba(0,245,255,' + (0.95 * gp) + ')');
  bg.addColorStop(1,   'rgba(0,245,255,' + (0.25 * gp) + ')');
  ctx.fillStyle   = bg;
  ctx.shadowColor = 'rgba(0,245,255,' + gp + ')';
  ctx.shadowBlur  = 20;
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(slider.x + 3, slider.y + 1, slider.w - 6, 2, 1);
  ctx.fillStyle  = 'rgba(255,255,255,0.55)';
  ctx.shadowBlur = 0;
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(slider.x + slider.w / 2 + (i - 1) * 10, slider.y + slider.h / 2, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }

  ctx.restore();
}

// ===== PHYSICS UPDATE =====
function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vy += 0.22;

  if (ball.x - ball.r < 0) {
    ball.x  = ball.r;
    ball.vx = Math.abs(ball.vx);
    spawnParticles(ball.x, ball.y, '#00f5ff', 6);
  }
  if (ball.x + ball.r > canvas.width) {
    ball.x  = canvas.width - ball.r;
    ball.vx = -Math.abs(ball.vx);
    spawnParticles(ball.x, ball.y, '#00f5ff', 6);
  }
  if (ball.y - ball.r < 0) {
    ball.y  = ball.r;
    ball.vy = Math.abs(ball.vy);
    spawnParticles(ball.x, ball.y, '#ff0080', 6);
  }

  // Slider catch detection
  const sliderTop = slider.y;
  if (
    ball.vy > 0 &&
    ball.y + ball.r >= sliderTop &&
    ball.y + ball.r <= sliderTop + slider.h + Math.abs(ball.vy) + 4 &&
    ball.x + ball.r * 0.5 >= slider.x &&
    ball.x - ball.r * 0.5 <= slider.x + slider.w
  ) {
    ball.y = sliderTop - ball.r;

    const relX = (ball.x - (slider.x + slider.w / 2)) / (slider.w / 2);
    ball.vx = relX * (Math.abs(ball.vx) + 2) + ball.vx * 0.25;
    ball.vy = -(Math.abs(ball.vy) * 0.90 + 1);

    const maxSpd = 13 + currentLap * 2;
    const spd    = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (spd > maxSpd) {
      ball.vx = (ball.vx / spd) * maxSpd;
      ball.vy = (ball.vy / spd) * maxSpd;
    }
    if (Math.abs(ball.vy) < 6) ball.vy = -6;

    score                 += 10 * streak;
    lapScores[currentLap] += 10 * streak;
    streak                 = Math.min(streak + 1, 10);
    ball.hue               = (ball.hue + 30) % 360;

    updateScoreDisplay();
    updateStreakDisplay();
    spawnParticles(ball.x, ball.y, 'hsl(' + ball.hue + ',100%,60%)', 18);
    slider.glowAnim = 0;
  }

  if (ball.y - ball.r > canvas.height) {
    flashDanger();
    endLap();
    return false;
  }

  updateTrail();
  return true;
}

// ===== UI HELPERS =====
function updateScoreDisplay() {
  const el = document.getElementById('score-display');
  el.textContent = String(score).padStart(3, '0');
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}

function updateStreakDisplay() {
  document.getElementById('streak-display').textContent = '×' + streak;
}

function updateLapIndicators() {
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById('li' + (i + 1));
    el.className = 'lap-ind';
    if      (i < currentLap)   el.classList.add('done');
    else if (i === currentLap) el.classList.add('active');
  }
}

function flashDanger() {
  const el = document.getElementById('danger-flash');
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}

// ===== GAME FLOW =====
function startGame() {
  score       = 0;
  lapScores   = [0, 0, 0];
  currentLap  = 0;
  streak      = 1;
  particles   = [];
  trailPoints = [];
  gameState   = 'playing';

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('lap-overlay').classList.remove('show');

  // resizeCanvas FIRST — ball/slider positions depend on canvas dimensions
  resizeCanvas();
  initBall(currentLap);
  initSlider();

  updateScoreDisplay();
  updateStreakDisplay();
  updateLapIndicators();

  if (animId) cancelAnimationFrame(animId);
  animId = null;
  gameLoop();
}

function endLap() {
  gameState = 'lapEnd';
  streak    = 1;
  updateStreakDisplay();
  if (animId) { cancelAnimationFrame(animId); animId = null; }

  document.getElementById('lap-number-display').textContent = currentLap + 1;
  document.getElementById('lap-score-text').textContent     = 'SCORE: ' + String(score).padStart(3, '0');

  const btn = document.getElementById('lap-continue-btn');
  if (currentLap >= 2) {
    btn.textContent = 'SEE RESULTS';
    btn.onclick     = showGameOver;
  } else {
    btn.textContent = 'NEXT LAP';
    btn.onclick     = nextLap;
  }

  document.getElementById('lap-overlay').classList.add('show');
}

function nextLap() {
  currentLap++;
  streak      = 1;
  particles   = [];
  trailPoints = [];
  gameState   = 'playing';

  document.getElementById('lap-overlay').classList.remove('show');

  resizeCanvas();
  initBall(currentLap);
  initSlider();

  updateLapIndicators();
  updateStreakDisplay();

  if (animId) cancelAnimationFrame(animId);
  animId = null;
  gameLoop();
}

function showGameOver() {
  gameState = 'gameover';
  if (animId) { cancelAnimationFrame(animId); animId = null; }

  document.getElementById('lap-overlay').classList.remove('show');
  document.getElementById('hud').style.display = 'none';

  document.getElementById('final-score').textContent = String(score).padStart(3, '0');
  document.getElementById('ls1').textContent         = lapScores[0];
  document.getElementById('ls2').textContent         = lapScores[1];
  document.getElementById('ls3').textContent         = lapScores[2];

  document.getElementById('gameover-screen').classList.remove('hidden');
}

// ===== GAME LOOP =====
function gameLoop() {
  if (gameState !== 'playing') return;

  drawBackground();
  updateParticles();
  drawTrail();
  drawParticles();
  drawBall();
  drawSlider();

  const alive = updateBall();
  if (alive) {
    animId = requestAnimationFrame(gameLoop);
  }
}

function goHome() {
  gameState = 'start';
  if (animId) { cancelAnimationFrame(animId); animId = null; }

  document.getElementById('gameover-screen').classList.add('hidden');
  document.getElementById('hud').style.display = 'none';
  document.getElementById('lap-overlay').classList.remove('show');
  document.getElementById('start-screen').classList.remove('hidden');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ===== BUTTON WIRING =====
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('home-btn').addEventListener('click', goHome);

document.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false });

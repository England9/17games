const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const hud = document.getElementById('hud')
const startBtn = document.getElementById('startBtn')
const scoreEl = document.getElementById('score')
const bestEl = document.getElementById('best')

const W = canvas.width
const H = canvas.height
const GROUND = 72
const GRAVITY = 0.42
const FLAP = -7.2
const PIPE_W = 68
const GAP = 158
const SPEED = 2.55
const STORAGE_KEY = '17games-flappy-bee-best'

const state = {
  mode: 'ready', // ready | playing | dead
  bee: { x: 96, y: H * 0.42, vy: 0, rot: 0 },
  pipes: [],
  score: 0,
  best: Number(localStorage.getItem(STORAGE_KEY) || 0),
  frame: 0,
  groundX: 0,
}

bestEl.textContent = String(state.best)

function reset() {
  state.mode = 'playing'
  state.bee = { x: 96, y: H * 0.42, vy: 0, rot: 0 }
  state.pipes = []
  state.score = 0
  state.frame = 0
  state.groundX = 0
  scoreEl.textContent = '0'
  hud.classList.add('hidden')
  spawnPipe()
}

function spawnPipe() {
  const min = 90
  const max = H - GROUND - GAP - 90
  const top = min + Math.random() * (max - min)
  state.pipes.push({
    x: W + 20,
    top,
    gap: GAP,
    scored: false,
  })
}

function flap() {
  if (state.mode === 'ready') {
    reset()
  }
  if (state.mode === 'playing') {
    state.bee.vy = FLAP
  } else if (state.mode === 'dead') {
    // wait for button
  }
}

function hitTest() {
  const bee = state.bee
  const r = 16
  if (bee.y + r >= H - GROUND || bee.y - r <= 0) return true

  for (const pipe of state.pipes) {
    const inX = bee.x + r > pipe.x && bee.x - r < pipe.x + PIPE_W
    if (!inX) continue
    const bottomY = pipe.top + pipe.gap
    if (bee.y - r < pipe.top || bee.y + r > bottomY) return true
  }
  return false
}

function die() {
  state.mode = 'dead'
  if (state.score > state.best) {
    state.best = state.score
    localStorage.setItem(STORAGE_KEY, String(state.best))
    bestEl.textContent = String(state.best)
  }
  hud.querySelector('.title').textContent = 'Buzzkill'
  hud.querySelector('.hint').textContent = `Score ${state.score} · Best ${state.best}`
  startBtn.textContent = 'Try again'
  hud.classList.remove('hidden')
}

function update() {
  state.frame += 1
  state.groundX = (state.groundX - SPEED) % 48

  if (state.mode !== 'playing') return

  const bee = state.bee
  bee.vy += GRAVITY
  bee.y += bee.vy
  bee.rot = Math.max(-0.45, Math.min(0.9, bee.vy * 0.08))

  if (state.frame % 96 === 0) spawnPipe()

  for (const pipe of state.pipes) {
    pipe.x -= SPEED
    if (!pipe.scored && pipe.x + PIPE_W < bee.x) {
      pipe.scored = true
      state.score += 1
      scoreEl.textContent = String(state.score)
    }
  }
  state.pipes = state.pipes.filter((p) => p.x + PIPE_W > -10)

  if (hitTest()) die()
}

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#8fd3ff')
  g.addColorStop(0.55, '#b8e986')
  g.addColorStop(1, '#6fbf5a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  // soft clouds
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  for (let i = 0; i < 4; i += 1) {
    const x = ((i * 140 + state.frame * 0.3) % (W + 120)) - 60
    const y = 60 + i * 38
    ctx.beginPath()
    ctx.ellipse(x, y, 42, 18, 0, 0, Math.PI * 2)
    ctx.ellipse(x + 28, y + 4, 30, 14, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPipes() {
  for (const pipe of state.pipes) {
    // flower stems / pipes
    const stem = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_W, 0)
    stem.addColorStop(0, '#2f7a2f')
    stem.addColorStop(0.5, '#4caf50')
    stem.addColorStop(1, '#246b24')
    ctx.fillStyle = stem
    ctx.fillRect(pipe.x, 0, PIPE_W, pipe.top)
    ctx.fillRect(pipe.x, pipe.top + pipe.gap, PIPE_W, H - GROUND - (pipe.top + pipe.gap))

    // flower caps
    drawFlowerCap(pipe.x + PIPE_W / 2, pipe.top - 8, 1)
    drawFlowerCap(pipe.x + PIPE_W / 2, pipe.top + pipe.gap + 8, -1)
  }
}

function drawFlowerCap(x, y, dir) {
  ctx.fillStyle = '#ff6fa8'
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI * 2 * i) / 6
    ctx.beginPath()
    ctx.ellipse(x + Math.cos(a) * 18, y + Math.sin(a) * 10 * dir, 14, 10, a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#ffd54a'
  ctx.beginPath()
  ctx.arc(x, y, 12, 0, Math.PI * 2)
  ctx.fill()
}

function drawGround() {
  ctx.fillStyle = '#5a3a1a'
  ctx.fillRect(0, H - GROUND, W, GROUND)
  ctx.fillStyle = '#3f7d2e'
  ctx.fillRect(0, H - GROUND, W, 18)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  for (let x = state.groundX; x < W + 48; x += 48) {
    ctx.fillRect(x, H - GROUND + 22, 24, 8)
  }
}

function drawBee() {
  const { x, y, rot } = state.bee
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)

  // wings
  const flapWing = Math.sin(state.frame * 0.8) * 0.35
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath()
  ctx.ellipse(-4, -14, 14, 8, -0.5 + flapWing, 0, Math.PI * 2)
  ctx.ellipse(8, -14, 14, 8, 0.5 - flapWing, 0, Math.PI * 2)
  ctx.fill()

  // body
  const body = ctx.createLinearGradient(-18, 0, 18, 0)
  body.addColorStop(0, '#1a1200')
  body.addColorStop(0.2, '#f0b429')
  body.addColorStop(0.4, '#1a1200')
  body.addColorStop(0.6, '#f0b429')
  body.addColorStop(0.8, '#1a1200')
  body.addColorStop(1, '#f0b429')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2)
  ctx.fill()

  // head
  ctx.fillStyle = '#f7d56a'
  ctx.beginPath()
  ctx.arc(14, -2, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1a1200'
  ctx.beginPath()
  ctx.arc(17, -4, 2.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawReadyIdle() {
  state.bee.y = H * 0.42 + Math.sin(state.frame * 0.08) * 8
  state.bee.rot = 0
}

function render() {
  drawSky()
  drawPipes()
  drawGround()
  if (state.mode === 'ready') drawReadyIdle()
  drawBee()

  if (state.mode === 'playing') {
    ctx.fillStyle = 'rgba(4,23,20,0.55)'
    ctx.font = '700 42px Bricolage Grotesque, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(state.score), W / 2, 64)
  }
}

function loop() {
  update()
  render()
  requestAnimationFrame(loop)
}

function onPointer(e) {
  e.preventDefault()
  if (state.mode === 'dead') return
  flap()
}

startBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  reset()
})

canvas.addEventListener('pointerdown', onPointer)
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    if (state.mode === 'dead') {
      reset()
      return
    }
    flap()
  }
})

requestAnimationFrame(loop)

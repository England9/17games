const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const hud = document.getElementById('hud')
const startBtn = document.getElementById('startBtn')
const scoreEl = document.getElementById('score')
const bestEl = document.getElementById('best')

const W = canvas.width
const H = canvas.height
const GROUND = 72
const GRAVITY = 0.4
const FLAP = -7.0
const PIPE_W = 70
const GAP = 164
const SPEED = 2.7
const STORAGE_KEY = '17games-coca-cola-best'

const state = {
  mode: 'ready',
  can: { x: 96, y: H * 0.42, vy: 0, rot: 0 },
  pipes: [],
  bubbles: Array.from({ length: 18 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 2 + Math.random() * 4,
    s: 0.4 + Math.random() * 1.1,
  })),
  score: 0,
  best: Number(localStorage.getItem(STORAGE_KEY) || 0),
  frame: 0,
  groundX: 0,
}

bestEl.textContent = String(state.best)

function reset() {
  state.mode = 'playing'
  state.can = { x: 96, y: H * 0.42, vy: 0, rot: 0 }
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
  if (state.mode === 'ready') reset()
  if (state.mode === 'playing') state.can.vy = FLAP
}

function hitTest() {
  const can = state.can
  const hw = 12
  const hh = 20
  if (can.y + hh >= H - GROUND || can.y - hh <= 0) return true

  for (const pipe of state.pipes) {
    const inX = can.x + hw > pipe.x && can.x - hw < pipe.x + PIPE_W
    if (!inX) continue
    const bottomY = pipe.top + pipe.gap
    if (can.y - hh < pipe.top || can.y + hh > bottomY) return true
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
  hud.querySelector('.title').textContent = 'Went flat'
  hud.querySelector('.hint').textContent = `Score ${state.score} · Best ${state.best}`
  startBtn.textContent = 'Pour another'
  hud.classList.remove('hidden')
}

function update() {
  state.frame += 1
  state.groundX = (state.groundX - SPEED) % 40

  for (const b of state.bubbles) {
    b.y -= b.s
    if (b.y < -10) {
      b.y = H + 10
      b.x = Math.random() * W
    }
  }

  if (state.mode !== 'playing') return

  const can = state.can
  can.vy += GRAVITY
  can.y += can.vy
  can.rot = Math.max(-0.4, Math.min(0.85, can.vy * 0.075))

  if (state.frame % 92 === 0) spawnPipe()

  for (const pipe of state.pipes) {
    pipe.x -= SPEED
    if (!pipe.scored && pipe.x + PIPE_W < can.x) {
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
  g.addColorStop(0, '#7ec8ff')
  g.addColorStop(0.55, '#f7f2ea')
  g.addColorStop(1, '#d9ecff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(200,16,46,0.08)'
  for (const b of state.bubbles) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawIceStack(x, y, h, flip) {
  const stackH = h
  const top = flip ? y : y - stackH
  const grad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0)
  grad.addColorStop(0, '#b9d9ef')
  grad.addColorStop(0.45, '#eef8ff')
  grad.addColorStop(1, '#8ebfdc')
  ctx.fillStyle = grad
  ctx.fillRect(x, top, PIPE_W, stackH)

  // bottle silhouettes on the ice columns
  ctx.fillStyle = 'rgba(200,16,46,0.55)'
  const count = Math.max(2, Math.floor(stackH / 70))
  for (let i = 0; i < count; i += 1) {
    const by = top + 18 + i * 68
    if (by + 50 > top + stackH) break
    drawMiniBottle(x + PIPE_W / 2, by)
  }

  // rim
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillRect(x - 4, flip ? top : top + stackH - 10, PIPE_W + 8, 10)
}

function drawMiniBottle(x, y) {
  ctx.beginPath()
  ctx.moveTo(x - 10, y + 42)
  ctx.lineTo(x - 12, y + 12)
  ctx.lineTo(x - 6, y + 4)
  ctx.lineTo(x - 6, y)
  ctx.lineTo(x + 6, y)
  ctx.lineTo(x + 6, y + 4)
  ctx.lineTo(x + 12, y + 12)
  ctx.lineTo(x + 10, y + 42)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillRect(x - 7, y + 18, 14, 6)
  ctx.fillStyle = 'rgba(200,16,46,0.55)'
}

function drawPipes() {
  for (const pipe of state.pipes) {
    drawIceStack(pipe.x, pipe.top, pipe.top, false)
    const bottomH = H - GROUND - (pipe.top + pipe.gap)
    drawIceStack(pipe.x, pipe.top + pipe.gap, bottomH, true)
  }
}

function drawGround() {
  ctx.fillStyle = '#c8102e'
  ctx.fillRect(0, H - GROUND, W, GROUND)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, H - GROUND, W, 14)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  for (let x = state.groundX; x < W + 40; x += 40) {
    ctx.beginPath()
    ctx.arc(x + 12, H - 28, 8, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCan() {
  const { x, y, rot } = state.can
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)

  // can body
  const body = ctx.createLinearGradient(-14, 0, 14, 0)
  body.addColorStop(0, '#7a0a1c')
  body.addColorStop(0.35, '#c8102e')
  body.addColorStop(0.7, '#ef3b55')
  body.addColorStop(1, '#7a0a1c')
  ctx.fillStyle = body
  roundRect(-14, -22, 28, 44, 8)
  ctx.fill()

  // white ribbon
  ctx.fillStyle = '#fff'
  ctx.fillRect(-14, -4, 28, 10)
  ctx.fillStyle = '#c8102e'
  ctx.font = 'bold 8px Manrope, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('COLA', 0, 4)

  // top rim
  ctx.fillStyle = '#d7d7d7'
  roundRect(-12, -26, 24, 6, 3)
  ctx.fill()

  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  roundRect(-10, -18, 5, 34, 3)
  ctx.fill()

  ctx.restore()
}

function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function drawReadyIdle() {
  state.can.y = H * 0.42 + Math.sin(state.frame * 0.08) * 8
  state.can.rot = 0
}

function render() {
  drawSky()
  drawPipes()
  drawGround()
  if (state.mode === 'ready') drawReadyIdle()
  drawCan()

  if (state.mode === 'playing') {
    ctx.fillStyle = 'rgba(26,5,8,0.55)'
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

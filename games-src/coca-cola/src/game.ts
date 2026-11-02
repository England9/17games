import {
  drawEntity,
  drawLogoRibbon,
  drawRecycleMachine,
  type SpriteKind,
} from './sprites'

export type GameMode = 'title' | 'playing' | 'ended'

type FlyingKind = Exclude<SpriteKind, 'pellet'>

interface Entity {
  id: number
  kind: FlyingKind
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  spin: number
  radius: number
  scale: number
  alive: boolean
  /** When recycling, fly toward machine */
  recycling?: boolean
}

interface Pellet {
  x: number
  y: number
  vx: number
  vy: number
  alive: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  text?: string
}

interface SliceTrail {
  x: number
  y: number
  life: number
}

const ROUND_SECONDS = 60
const W = 960
const H = 640

const POINTS: Record<FlyingKind, number> = {
  bag: 10,
  garbage: 15,
  bomb: -50,
  emptyBottle: 40,
  coke: 0,
  cokeZero: 0,
}

let nextId = 1

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export class RecycleRushGame {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  mode: GameMode = 'title'
  score = 0
  timeLeft = ROUND_SECONDS
  entities: Entity[] = []
  pellets: Pellet[] = []
  particles: Particle[] = []
  trails: SliceTrail[] = []
  spawnTimer = 0
  elapsed = 0
  machinePulse = 0
  fireCooldown = 0
  baseFireRate = 0.22
  fireRateBoost = 0
  powerToast = ''
  powerToastTimer = 0
  titleBob = 0
  pointerDown = false
  lastPointer = { x: 0, y: 0 }
  aim = { x: W / 2, y: H / 2 }
  sliceActive = false
  slicedIds = new Set<number>()
  combo = 0
  comboTimer = 0
  shake = 0
  recycledCount = 0
  trashCleared = 0
  bombHits = 0
  bestScore = Number(localStorage.getItem('crr-best') || '0')
  private running = false
  private lastTs = 0
  private boundResize: () => void
  private dpr = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    this.boundResize = () => this.resize()
    this.resize()
    this.bindInput()
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTs = performance.now()
    requestAnimationFrame(this.frame)
    window.addEventListener('resize', this.boundResize)
  }

  private resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = W * this.dpr
    this.canvas.height = H * this.dpr
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
  }

  private pointerPos(e: PointerEvent | Touch) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    }
  }

  private bindInput() {
    const onDown = (e: PointerEvent) => {
      e.preventDefault()
      const p = this.pointerPos(e)
      this.pointerDown = true
      this.lastPointer = p
      this.aim = p
      this.sliceActive = true
      this.slicedIds.clear()

      if (this.mode === 'title') {
        if (this.hitPlayButton(p.x, p.y)) this.beginRound()
        return
      }
      if (this.mode === 'ended') {
        if (this.hitPlayButton(p.x, p.y)) this.beginRound()
        return
      }
      if (this.mode === 'playing') {
        this.tryShoot(p.x, p.y)
      }
    }

    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      const p = this.pointerPos(e)
      this.aim = p
      if (!this.pointerDown || this.mode !== 'playing') return

      // swipe slice along path
      this.trails.push({ x: p.x, y: p.y, life: 0.25 })
      this.sliceAlong(this.lastPointer.x, this.lastPointer.y, p.x, p.y)
      this.lastPointer = p
    }

    const onUp = (e: PointerEvent) => {
      e.preventDefault()
      this.pointerDown = false
      this.sliceActive = false
      this.slicedIds.clear()
    }

    this.canvas.addEventListener('pointerdown', onDown)
    this.canvas.addEventListener('pointermove', onMove)
    this.canvas.addEventListener('pointerup', onUp)
    this.canvas.addEventListener('pointercancel', onUp)
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private hitPlayButton(x: number, y: number) {
    const bx = W / 2
    const by = this.mode === 'title' ? H * 0.68 : H * 0.78
    return Math.abs(x - bx) < 110 && Math.abs(y - by) < 36
  }

  beginRound() {
    this.mode = 'playing'
    this.score = 0
    this.timeLeft = ROUND_SECONDS
    this.entities = []
    this.pellets = []
    this.particles = []
    this.trails = []
    this.spawnTimer = 0.4
    this.elapsed = 0
    this.machinePulse = 0
    this.fireCooldown = 0
    this.fireRateBoost = 0
    this.powerToast = ''
    this.powerToastTimer = 0
    this.combo = 0
    this.comboTimer = 0
    this.shake = 0
    this.recycledCount = 0
    this.trashCleared = 0
    this.bombHits = 0
  }

  private endRound() {
    this.mode = 'ended'
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      localStorage.setItem('crr-best', String(this.bestScore))
    }
  }

  private tryShoot(tx: number, ty: number) {
    if (this.fireCooldown > 0) return
    const rate = Math.max(0.08, this.baseFireRate - this.fireRateBoost)
    this.fireCooldown = rate

    const originX = W / 2
    const originY = H - 36
    const dx = tx - originX
    const dy = ty - originY
    const len = Math.hypot(dx, dy) || 1
    const speed = 920
    this.pellets.push({
      x: originX,
      y: originY,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      alive: true,
    })
  }

  private spawnEntity() {
    const t = 1 - this.timeLeft / ROUND_SECONDS
    const roll = Math.random()
    let kind: FlyingKind
    if (roll < 0.1 + t * 0.08) kind = 'bomb'
    else if (roll < 0.22) kind = 'emptyBottle'
    else if (roll < 0.3) kind = 'coke'
    else if (roll < 0.36) kind = 'cokeZero'
    else if (roll < 0.68) kind = 'bag'
    else kind = 'garbage'

    const fromLeft = Math.random() < 0.5
    const x = fromLeft ? -40 : W + 40
    const y = rand(H * 0.18, H * 0.62)
    const speed = rand(140, 220 + t * 120)
    const vx = (fromLeft ? 1 : -1) * speed
    const vy = rand(-40, 80)
    const radius =
      kind === 'bomb' ? 28 : kind === 'bag' ? 30 : kind === 'garbage' ? 26 : 24

    this.entities.push({
      id: nextId++,
      kind,
      x,
      y,
      vx,
      vy,
      rotation: rand(0, Math.PI * 2),
      spin: rand(-2.5, 2.5),
      radius,
      scale: rand(0.9, 1.15),
      alive: true,
    })
  }

  private sliceAlong(x0: number, y0: number, x1: number, y1: number) {
    for (const e of this.entities) {
      if (!e.alive || e.recycling || this.slicedIds.has(e.id)) continue
      if (distToSegment(e.x, e.y, x0, y0, x1, y1) <= e.radius + 8) {
        this.slicedIds.add(e.id)
        this.hitEntity(e, true)
      }
    }
  }

  private hitEntity(e: Entity, fromSlice: boolean) {
    if (!e.alive) return

    if (e.kind === 'bomb') {
      e.alive = false
      this.bombHits++
      this.score = Math.max(0, this.score + POINTS.bomb)
      this.shake = 0.45
      this.combo = 0
      this.burst(e.x, e.y, '#FF6622', 24)
      this.floatText(e.x, e.y, '-50 BOMB!', '#FF8866')
      return
    }

    if (e.kind === 'coke') {
      e.alive = false
      this.fireRateBoost = Math.min(0.14, this.fireRateBoost + 0.05)
      this.powerToast = 'Coca-Cola! Faster shots!'
      this.powerToastTimer = 2.2
      this.burst(e.x, e.y, '#E61A27', 18)
      this.floatText(e.x, e.y, 'POWER!', '#FFE8EA')
      return
    }

    if (e.kind === 'cokeZero') {
      e.alive = false
      this.timeLeft = Math.min(ROUND_SECONDS + 15, this.timeLeft + 5)
      this.powerToast = 'Coke Zero! +5 seconds!'
      this.powerToastTimer = 2.2
      this.burst(e.x, e.y, '#7EC8FF', 18)
      this.floatText(e.x, e.y, '+5s!', '#AADDFF')
      return
    }

    if (e.kind === 'emptyBottle') {
      // send to recycling machine
      e.recycling = true
      e.vx = 0
      e.vy = 0
      this.combo++
      this.comboTimer = 1.4
      return
    }

    // trash
    e.alive = false
    this.trashCleared++
    const bonus = Math.min(5, this.combo) * 2
    const pts = POINTS[e.kind] + bonus
    this.score += pts
    this.combo++
    this.comboTimer = 1.4
    this.burst(e.x, e.y, e.kind === 'bag' ? '#A8C5D4' : '#95A888', 14)
    this.floatText(e.x, e.y, `+${pts}`, '#FFF8F8')
    void fromSlice
  }

  private completeRecycle(e: Entity) {
    e.alive = false
    e.recycling = false
    this.recycledCount++
    const pts = POINTS.emptyBottle + Math.min(5, this.combo) * 3
    this.score += pts
    this.machinePulse = 1
    this.burst(W - 90, H - 120, '#7CFFB2', 22)
    this.floatText(W - 90, H - 160, `RECYCLE +${pts}`, '#7CFFB2')
  }

  private burst(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = rand(40, 220)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.3, 0.7),
        maxLife: 0.7,
        color,
        size: rand(2, 6),
      })
    }
  }

  private floatText(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: rand(-20, 20),
      vy: -80,
      life: 0.9,
      maxLife: 0.9,
      color,
      size: 14,
      text,
    })
  }

  private frame = (ts: number) => {
    if (!this.running) return
    const dt = Math.min(0.033, (ts - this.lastTs) / 1000)
    this.lastTs = ts
    this.update(dt)
    this.draw()
    requestAnimationFrame(this.frame)
  }

  private update(dt: number) {
    this.titleBob += dt
    this.elapsed += dt

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt)
    if (this.machinePulse > 0) this.machinePulse = Math.max(0, this.machinePulse - dt * 1.5)
    if (this.powerToastTimer > 0) this.powerToastTimer = Math.max(0, this.powerToastTimer - dt)
    if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) this.combo = 0
    }

    for (const t of this.trails) t.life -= dt
    this.trails = this.trails.filter((t) => t.life > 0)

    for (const p of this.particles) {
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 40 * dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)

    if (this.mode !== 'playing') return

    this.timeLeft -= dt
    if (this.timeLeft <= 0) {
      this.timeLeft = 0
      this.endRound()
      return
    }

    this.fireCooldown = Math.max(0, this.fireCooldown - dt)
    // hold-to-auto-fire toward aim
    if (this.pointerDown && this.fireCooldown <= 0) {
      this.tryShoot(this.aim.x, this.aim.y)
    }

    // spawn
    const intensity = 0.55 + (1 - this.timeLeft / ROUND_SECONDS) * 0.9
    this.spawnTimer -= dt
    if (this.spawnTimer <= 0) {
      this.spawnEntity()
      if (Math.random() < 0.35) this.spawnEntity()
      this.spawnTimer = rand(0.35, 0.85) / intensity
    }

    const mx = W - 90
    const my = H - 100

    for (const e of this.entities) {
      if (!e.alive) continue
      if (e.recycling) {
        const dx = mx - e.x
        const dy = my - e.y
        const d = Math.hypot(dx, dy) || 1
        e.vx = (dx / d) * 520
        e.vy = (dy / d) * 520
        e.x += e.vx * dt
        e.y += e.vy * dt
        e.scale = Math.max(0.3, e.scale - dt * 1.2)
        if (d < 28) this.completeRecycle(e)
        continue
      }
      e.x += e.vx * dt
      e.y += e.vy * dt
      e.vy += 28 * dt
      e.rotation += e.spin * dt
      if (e.x < -80 || e.x > W + 80 || e.y > H + 80) e.alive = false
    }
    this.entities = this.entities.filter((e) => e.alive)

    for (const p of this.pellets) {
      if (!p.alive) continue
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
        p.alive = false
        continue
      }
      for (const e of this.entities) {
        if (!e.alive || e.recycling) continue
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 8) {
          p.alive = false
          this.hitEntity(e, false)
          break
        }
      }
    }
    this.pellets = this.pellets.filter((p) => p.alive)
  }

  private drawBackground() {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#5c0710')
    g.addColorStop(0.45, '#9e0b14')
    g.addColorStop(1, '#e61a27')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // soft bubbles / sparkles atmosphere
    ctx.save()
    for (let i = 0; i < 18; i++) {
      const px = (i * 97 + this.elapsed * 18) % (W + 40) - 20
      const py = (i * 53 + Math.sin(this.elapsed + i) * 20) % H
      ctx.globalAlpha = 0.08 + (i % 5) * 0.02
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(px, py, 6 + (i % 4) * 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // wavy floor
    ctx.fillStyle = 'rgba(255,248,248,0.12)'
    ctx.beginPath()
    ctx.moveTo(0, H - 70)
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, H - 70 + Math.sin(x * 0.02 + this.elapsed) * 6)
    }
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fill()
  }

  private drawHud() {
    const ctx = this.ctx
    // top bar
    ctx.fillStyle = 'rgba(43,10,12,0.45)'
    roundRectPath(ctx, 16, 12, W - 32, 52, 16)
    ctx.fill()

    ctx.fillStyle = '#FFF8F8'
    ctx.font = '700 22px Fredoka, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Score  ${this.score}`, 36, 38)

    ctx.textAlign = 'center'
    ctx.fillText(`⏱ ${Math.ceil(this.timeLeft)}s`, W / 2, 38)

    ctx.textAlign = 'right'
    const rateBoost = this.fireRateBoost > 0.01 ? ' ⚡' : ''
    ctx.fillText(`Recycled ${this.recycledCount}${rateBoost}`, W - 36, 38)

    if (this.combo > 1) {
      ctx.fillStyle = '#FFE566'
      ctx.font = '700 18px Fredoka, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`Combo x${this.combo}!`, W / 2, 84)
    }

    if (this.powerToastTimer > 0) {
      ctx.globalAlpha = Math.min(1, this.powerToastTimer)
      ctx.fillStyle = '#FFF8F8'
      ctx.font = '700 20px Fredoka, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(this.powerToast, W / 2, 112)
      ctx.globalAlpha = 1
    }
  }

  private drawShooter() {
    const ctx = this.ctx
    const x = W / 2
    const y = H - 28
    // cute soda-pop shooter
    ctx.save()
    ctx.translate(x, y)
    const ang = Math.atan2(this.aim.y - y, this.aim.x - x)
    ctx.rotate(ang)

    ctx.fillStyle = '#E61A27'
    ctx.strokeStyle = '#2b0a0c'
    ctx.lineWidth = 2.5
    roundRectPath(ctx, -14, -14, 48, 28, 12)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#FFF8F8'
    roundRectPath(ctx, 20, -6, 22, 12, 6)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    // aim guide
    if (this.mode === 'playing') {
      ctx.strokeStyle = 'rgba(255,248,248,0.25)'
      ctx.setLineDash([6, 8])
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(this.aim.x, this.aim.y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(255,248,248,0.5)'
      ctx.beginPath()
      ctx.arc(this.aim.x, this.aim.y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawPlayButton(label: string, y: number) {
    const ctx = this.ctx
    const pulse = 1 + Math.sin(this.titleBob * 3) * 0.03
    ctx.save()
    ctx.translate(W / 2, y)
    ctx.scale(pulse, pulse)
    ctx.fillStyle = '#FFF8F8'
    roundRectPath(ctx, -110, -34, 220, 68, 34)
    ctx.fill()
    ctx.strokeStyle = '#2b0a0c'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = '#E61A27'
    ctx.font = '700 28px Fredoka, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 0, 2)
    ctx.restore()
  }

  private drawTitle() {
    const ctx = this.ctx
    this.drawBackground()

    // floating kawaii bottles
    const bob = Math.sin(this.titleBob * 2) * 10
    drawEntity(ctx, 'coke', W * 0.18, H * 0.42 + bob, 1.3, -0.2, this.elapsed)
    drawEntity(ctx, 'emptyBottle', W * 0.82, H * 0.4 - bob, 1.2, 0.25, this.elapsed)
    drawEntity(ctx, 'bag', W * 0.72, H * 0.58 + bob * 0.5, 1.1, 0.1, this.elapsed)

    drawLogoRibbon(ctx, W / 2, 110 + Math.sin(this.titleBob) * 4, 360)

    ctx.fillStyle = '#FFF8F8'
    ctx.font = '700 54px Fredoka, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Refresh Rush', W / 2, 190)

    ctx.font = '400 18px Fredoka, sans-serif'
    ctx.fillStyle = 'rgba(255,248,248,0.9)'
    ctx.fillText('Swipe or shoot trash · Recycle empty bottles · Avoid bombs!', W / 2, 240)

    // how-to chips
    const tips = [
      { label: 'Trash', kind: 'bag' as const },
      { label: 'Recycle', kind: 'emptyBottle' as const },
      { label: 'Bomb!', kind: 'bomb' as const },
      { label: 'Power', kind: 'coke' as const },
    ]
    tips.forEach((tip, i) => {
      const tx = W / 2 - 210 + i * 140
      const ty = H * 0.48
      drawEntity(ctx, tip.kind, tx, ty, 0.85, 0, this.elapsed)
      ctx.fillStyle = '#FFF8F8'
      ctx.font = '600 14px Fredoka, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(tip.label, tx, ty + 48)
    })

    this.drawPlayButton('Play', H * 0.68)

    ctx.fillStyle = 'rgba(255,248,248,0.7)'
    ctx.font = '400 14px Fredoka, sans-serif'
    ctx.fillText('60-second round · Mouse or touch', W / 2, H * 0.82)
  }

  private drawEnd() {
    const ctx = this.ctx
    this.drawBackground()
    drawRecycleMachine(ctx, W - 90, H - 100, 0.4)

    drawLogoRibbon(ctx, W / 2, 100, 340)

    ctx.fillStyle = '#FFF8F8'
    ctx.font = '700 42px Fredoka, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText("Time's Up!", W / 2, 175)

    ctx.font = '700 64px Fredoka, sans-serif'
    ctx.fillText(String(this.score), W / 2, 255)
    ctx.font = '600 20px Fredoka, sans-serif'
    ctx.fillStyle = 'rgba(255,248,248,0.85)'
    ctx.fillText('Final Score', W / 2, 295)

    ctx.font = '500 16px Fredoka, sans-serif'
    ctx.fillText(
      `Trash cleared ${this.trashCleared}  ·  Recycled ${this.recycledCount}  ·  Bombs ${this.bombHits}`,
      W / 2,
      335,
    )
    ctx.fillText(`Best ${this.bestScore}`, W / 2, 360)

    // slogan — exact wording required
    ctx.fillStyle = '#FFF8F8'
    ctx.font = '600 22px Pacifico, Fredoka, cursive'
    ctx.fillText('Refresh the World. Recycle the Future.', W / 2, 420)

    this.drawPlayButton('Play Again', H * 0.78)
  }

  private drawPlaying() {
    const ctx = this.ctx
    ctx.save()
    if (this.shake > 0) {
      const m = this.shake * 10
      ctx.translate(rand(-m, m), rand(-m, m))
    }

    this.drawBackground()
    drawRecycleMachine(ctx, W - 90, H - 100, this.machinePulse)

    // slice trails
    for (const t of this.trails) {
      ctx.globalAlpha = Math.max(0, t.life / 0.25)
      ctx.fillStyle = '#FFF8F8'
      ctx.beginPath()
      ctx.arc(t.x, t.y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    for (const e of this.entities) {
      drawEntity(ctx, e.kind, e.x, e.y, e.scale, e.rotation, this.elapsed)
    }
    for (const p of this.pellets) {
      drawEntity(ctx, 'pellet', p.x, p.y, 1, 0, this.elapsed)
    }

    this.drawShooter()
    this.drawHud()

    // particles / float text
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife)
      ctx.globalAlpha = a
      if (p.text) {
        ctx.fillStyle = p.color
        ctx.font = `700 ${p.size}px Fredoka, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(p.text, p.x, p.y)
      } else {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.restore()
  }

  private draw() {
    if (this.mode === 'title') this.drawTitle()
    else if (this.mode === 'ended') this.drawEnd()
    else this.drawPlaying()
  }
}

function distToSegment(
  px: number,
  py: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const dx = x1 - x0
  const dy = y1 - y0
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(px - x0, py - y0)
  let t = ((px - x0) * dx + (py - y0) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy))
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Kawaii Coca-Cola themed canvas sprite drawers */

export type SpriteKind =
  | 'bag'
  | 'garbage'
  | 'bomb'
  | 'emptyBottle'
  | 'coke'
  | 'cokeZero'
  | 'pellet'

const ink = '#2b0a0c'
const cokeRed = '#E61A27'
const cokeDeep = '#B0121C'
const cream = '#FFF8F8'
const blush = '#FF9AA8'
const recycleGreen = '#3CB371'
const zeroBlack = '#1a1a1a'

function roundRect(
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

function face(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  happy = true,
) {
  // blush
  ctx.fillStyle = blush
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.ellipse(x - 10 * scale, y + 2 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2)
  ctx.ellipse(x + 10 * scale, y + 2 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // eyes
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.ellipse(x - 7 * scale, y - 1 * scale, 2.6 * scale, 3.2 * scale, 0, 0, Math.PI * 2)
  ctx.ellipse(x + 7 * scale, y - 1 * scale, 2.6 * scale, 3.2 * scale, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x - 6 * scale, y - 2.4 * scale, 1.1 * scale, 0, Math.PI * 2)
  ctx.arc(x + 8 * scale, y - 2.4 * scale, 1.1 * scale, 0, Math.PI * 2)
  ctx.fill()

  // mouth
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.6 * scale
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (happy) {
    ctx.arc(x, y + 5 * scale, 4.5 * scale, 0.15 * Math.PI, 0.85 * Math.PI)
  } else {
    ctx.arc(x, y + 9 * scale, 4.5 * scale, 1.15 * Math.PI, 1.85 * Math.PI)
  }
  ctx.stroke()
}

export function drawBag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)

  // soft shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(2, 18, 22, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // bag body
  ctx.fillStyle = '#A8C5D4'
  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-22, -8)
  ctx.quadraticCurveTo(-26, 18, -18, 26)
  ctx.quadraticCurveTo(0, 32, 18, 26)
  ctx.quadraticCurveTo(26, 18, 22, -8)
  ctx.quadraticCurveTo(10, -14, 0, -10)
  ctx.quadraticCurveTo(-10, -14, -22, -8)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // handles
  ctx.beginPath()
  ctx.moveTo(-12, -10)
  ctx.quadraticCurveTo(-8, -28, 0, -24)
  ctx.quadraticCurveTo(8, -28, 12, -10)
  ctx.stroke()

  face(ctx, 0, 4, 1, true)

  // trash symbol
  ctx.fillStyle = cokeDeep
  ctx.font = 'bold 10px Fredoka, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('TRASH', 0, 22)

  ctx.restore()
}

export function drawGarbage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)

  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(2, 16, 18, 7, 0, 0, Math.PI * 2)
  ctx.fill()

  // crumpled ball
  ctx.fillStyle = '#7A8B6F'
  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 20, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#95A888'
  ctx.beginPath()
  ctx.arc(-8, -6, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(9, 4, 7, 0, Math.PI * 2)
  ctx.fill()

  face(ctx, 0, 0, 0.95, true)

  ctx.restore()
}

export function drawBomb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
  fusePulse = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)

  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(2, 18, 16, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // body
  ctx.fillStyle = '#2d2d2d'
  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 4, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath()
  ctx.ellipse(-6, -2, 6, 4, -0.4, 0, Math.PI * 2)
  ctx.fill()

  // fuse
  ctx.strokeStyle = '#C4A574'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, -14)
  ctx.quadraticCurveTo(8, -22, 4, -30)
  ctx.stroke()

  // spark
  const spark = 4 + Math.sin(fusePulse * 10) * 2
  ctx.fillStyle = '#FFCC33'
  ctx.beginPath()
  ctx.arc(4, -30, spark, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FF6622'
  ctx.beginPath()
  ctx.arc(4, -30, spark * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // X eyes / angry face
  ctx.strokeStyle = cream
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  // left X
  ctx.beginPath()
  ctx.moveTo(-10, -2)
  ctx.lineTo(-4, 4)
  ctx.moveTo(-4, -2)
  ctx.lineTo(-10, 4)
  // right X
  ctx.moveTo(4, -2)
  ctx.lineTo(10, 4)
  ctx.moveTo(10, -2)
  ctx.lineTo(4, 4)
  ctx.stroke()

  // frown
  ctx.beginPath()
  ctx.arc(0, 12, 5, Math.PI * 1.15, Math.PI * 1.85)
  ctx.stroke()

  // DON'T badge
  ctx.fillStyle = cokeRed
  roundRect(ctx, -16, 14, 32, 12, 4)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.font = 'bold 8px Fredoka, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText("DON'T!", 0, 20)

  ctx.restore()
}

function drawBottleBody(
  ctx: CanvasRenderingContext2D,
  fill: string,
  label: string,
  labelBg: string,
  empty: boolean,
) {
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(2, 30, 14, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // neck
  ctx.fillStyle = fill
  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  roundRect(ctx, -7, -32, 14, 14, 3)
  ctx.fill()
  ctx.stroke()

  // cap
  ctx.fillStyle = empty ? '#9aa' : cokeRed
  roundRect(ctx, -8, -38, 16, 8, 3)
  ctx.fill()
  ctx.stroke()

  // body
  ctx.fillStyle = fill
  roundRect(ctx, -16, -18, 32, 46, 12)
  ctx.fill()
  ctx.stroke()

  if (!empty) {
    // liquid shine
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    roundRect(ctx, -12, -10, 8, 30, 4)
    ctx.fill()
  } else {
    // empty glass look
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    roundRect(ctx, -12, -10, 8, 30, 4)
    ctx.fill()
    ctx.strokeStyle = recycleGreen
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 6, 8, -0.2, Math.PI * 1.4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(5, -2)
    ctx.lineTo(10, -6)
    ctx.lineTo(8, 2)
    ctx.closePath()
    ctx.fillStyle = recycleGreen
    ctx.fill()
  }

  // label
  ctx.fillStyle = labelBg
  roundRect(ctx, -14, -4, 28, 16, 4)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.font = 'bold 7px Fredoka, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 0, 4)
}

export function drawEmptyBottle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  drawBottleBody(ctx, 'rgba(220,240,255,0.75)', 'RECYCLE', recycleGreen, true)
  face(ctx, 0, -12, 0.7, true)
  ctx.restore()
}

export function drawCoke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  drawBottleBody(ctx, cokeRed, 'Coca-Cola', cokeDeep, false)
  face(ctx, 0, -12, 0.7, true)
  // sparkles
  ctx.fillStyle = '#FFE566'
  for (const [sx, sy] of [
    [-20, -20],
    [18, -8],
    [-18, 18],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(sx, sy - 4)
    ctx.lineTo(sx + 2, sy)
    ctx.lineTo(sx, sy + 4)
    ctx.lineTo(sx - 2, sy)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export function drawCokeZero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  rotation = 0,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  drawBottleBody(ctx, zeroBlack, 'Coke Zero', '#333', false)
  // red ribbon accent
  ctx.fillStyle = cokeRed
  roundRect(ctx, -14, 12, 28, 4, 2)
  ctx.fill()
  face(ctx, 0, -12, 0.7, true)
  ctx.fillStyle = '#7EC8FF'
  for (const [sx, sy] of [
    [-20, -18],
    [18, -6],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(sx, sy - 4)
    ctx.lineTo(sx + 2, sy)
    ctx.lineTo(sx, sy + 4)
    ctx.lineTo(sx - 2, sy)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export function drawPellet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = cream
  ctx.strokeStyle = cokeRed
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = cokeRed
  ctx.beginPath()
  ctx.arc(0, 0, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawRecycleMachine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pulse = 0,
) {
  ctx.save()
  ctx.translate(x, y)

  // body
  ctx.fillStyle = '#2E8B57'
  ctx.strokeStyle = ink
  ctx.lineWidth = 3
  roundRect(ctx, -48, -70, 96, 110, 16)
  ctx.fill()
  ctx.stroke()

  // top hopper
  ctx.fillStyle = '#3CB371'
  roundRect(ctx, -36, -88, 72, 24, 10)
  ctx.fill()
  ctx.stroke()

  // chute opening
  ctx.fillStyle = '#1a3d2a'
  roundRect(ctx, -28, -78, 56, 16, 6)
  ctx.fill()

  // screen
  ctx.fillStyle = '#0d2818'
  roundRect(ctx, -34, -48, 68, 36, 8)
  ctx.fill()
  ctx.fillStyle = '#7CFFB2'
  ctx.font = 'bold 11px Fredoka, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('RECYCLE', 0, -36)
  ctx.font = 'bold 10px Fredoka, sans-serif'
  ctx.fillText('ME!', 0, -22)

  // kawaii face on machine
  face(ctx, 0, 8, 1.1, true)

  // glow pulse when recycling
  if (pulse > 0) {
    ctx.globalAlpha = Math.min(1, pulse) * 0.45
    ctx.fillStyle = '#7CFFB2'
    ctx.beginPath()
    ctx.arc(0, -40, 40 + (1 - pulse) * 30, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // feet
  ctx.fillStyle = '#246B45'
  roundRect(ctx, -40, 36, 24, 10, 4)
  ctx.fill()
  roundRect(ctx, 16, 36, 24, 10, 4)
  ctx.fill()

  ctx.restore()
}

export function drawLogoRibbon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = cokeRed
  roundRect(ctx, -width / 2, -22, width, 44, 22)
  ctx.fill()
  ctx.fillStyle = cream
  ctx.font = '700 28px Pacifico, Fredoka, cursive'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Coca-Cola', 0, 2)
  ctx.restore()
}

export function drawEntity(
  ctx: CanvasRenderingContext2D,
  kind: SpriteKind,
  x: number,
  y: number,
  scale: number,
  rotation: number,
  t: number,
) {
  switch (kind) {
    case 'bag':
      drawBag(ctx, x, y, scale, rotation)
      break
    case 'garbage':
      drawGarbage(ctx, x, y, scale, rotation)
      break
    case 'bomb':
      drawBomb(ctx, x, y, scale, rotation, t)
      break
    case 'emptyBottle':
      drawEmptyBottle(ctx, x, y, scale, rotation)
      break
    case 'coke':
      drawCoke(ctx, x, y, scale, rotation)
      break
    case 'cokeZero':
      drawCokeZero(ctx, x, y, scale, rotation)
      break
    case 'pellet':
      drawPellet(ctx, x, y, scale)
      break
  }
}

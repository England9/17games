import './style.css'
import { RecycleRushGame } from './game'

const canvas = document.querySelector<HTMLCanvasElement>('#game')
if (!canvas) {
  throw new Error('Missing #game canvas')
}

const game = new RecycleRushGame(canvas)
game.start()

// Dev/demo helper for screenshots (not a player-facing feature)
declare global {
  interface Window {
    recycleRush: RecycleRushGame
  }
}
window.recycleRush = game

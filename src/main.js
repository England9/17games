import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="stage">
    <div class="atmosphere" aria-hidden="true"></div>
    <div class="sparkle" aria-hidden="true"></div>

    <header class="topbar">
      <a class="brand" href="/" aria-label="17 Games home">
        <span class="brand-mark" aria-hidden="true">♠</span>
        <span class="brand-text">17 Games</span>
      </a>
      <p class="brand-note">Arcade lounge</p>
    </header>

    <main class="hero">
      <div class="hero-copy">
        <p class="eyebrow">17 Spades presents</p>
        <h1>17 Games</h1>
        <p class="lede">
          Two quick hits from the lounge. Tap in, chase a high score, and get out before the next hand.
        </p>
        <div class="cta-row">
          <a class="cta primary" href="/games/flappy-bee/">Play Flappy Bee</a>
          <a class="cta secondary" href="/games/coca-cola/">Play Coca-Cola</a>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="orbit">
          <div class="orb bee-orb">
            <span class="glyph bee-glyph" aria-hidden="true"></span>
            <strong>Flappy Bee</strong>
          </div>
          <div class="orb cola-orb">
            <span class="glyph cola-glyph" aria-hidden="true"></span>
            <strong>Coca-Cola</strong>
          </div>
        </div>
      </div>
    </main>

    <section class="game-rail" aria-label="Playable games">
      <a class="portal bee" href="/games/flappy-bee/">
        <div class="portal-media bee-media"></div>
        <div class="portal-copy">
          <h2>Flappy Bee</h2>
          <p>Keep the bee buzzing between flower pipes. One mistimed tap and you are nectar.</p>
          <span class="play-chip">Play now</span>
        </div>
      </a>

      <a class="portal cola" href="/games/coca-cola/">
        <div class="portal-media cola-media"></div>
        <div class="portal-copy">
          <h2>Coca-Cola</h2>
          <p>Float the classic can through ice and bottle stacks. Stay fizzy. Stay airborne.</p>
          <span class="play-chip">Play now</span>
        </div>
      </a>
    </section>

    <footer class="foot">
      <p>Built for Cloudflare Pages · Drop replacement builds into <code>/games/&lt;name&gt;/</code></p>
    </footer>
  </div>
`

requestAnimationFrame(() => {
  document.querySelector('.stage')?.classList.add('is-live')
})

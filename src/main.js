import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="stage">
    <div class="sky" aria-hidden="true"></div>
    <div class="haze" aria-hidden="true"></div>

    <header class="topbar">
      <a class="brand" href="/" aria-label="17 Games home">
        <span class="brand-mark" aria-hidden="true">17</span>
        <span class="brand-text">Games</span>
      </a>
    </header>

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-plane" aria-hidden="true">
          <div class="plane-wash bee-wash"></div>
          <div class="plane-wash cola-wash"></div>
          <div class="plane-motif bee-motif"></div>
          <div class="plane-motif cola-motif"></div>
        </div>

        <div class="hero-copy">
          <h1 id="hero-title">17 Games</h1>
          <p class="lede">
            Two short browser games from our GPP class project — tap in, chase a score, and play again.
          </p>
          <div class="cta-row">
            <a class="cta primary" href="/games/flappy-bee/">Play Flappy Bee</a>
            <a class="cta secondary" href="/games/coca-cola/">Play Refresh Rush</a>
          </div>
        </div>
      </section>

      <section class="game-rail" aria-label="Playable games">
        <a class="portal bee" href="/games/flappy-bee/">
          <div class="portal-media bee-media" aria-hidden="true"></div>
          <div class="portal-copy">
            <h2>Flappy Bee</h2>
            <p>A tribute flyer for the Ginza Honey Bee Project. Pass pipes, grab honey, and keep flying.</p>
            <span class="play-link">Play Flappy Bee</span>
          </div>
        </a>

        <a class="portal cola" href="/games/coca-cola/">
          <div class="portal-media cola-media" aria-hidden="true"></div>
          <div class="portal-copy">
            <h2>Coca-Cola Refresh Rush</h2>
            <p>Swipe trash, bank empty bottles, and dodge bombs in a fizzy sixty-second rush.</p>
            <span class="play-link">Play Refresh Rush</span>
          </div>
        </a>
      </section>
    </main>

    <footer class="foot">
      <p>
        Made for GPP Class project by:
        Chris England, Kippe Anabuki, Merlijn van der Hout, Hayato Hashiyama, and Tomoshiro Tsukada
      </p>
    </footer>
  </div>
`

requestAnimationFrame(() => {
  document.querySelector('.stage')?.classList.add('is-live')
})

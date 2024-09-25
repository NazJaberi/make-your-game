const game = {
  fps: 60,
  width: window.innerWidth,
  height: window.innerHeight,
  isRunning: false,
  lastTime: 0,

  init() {
    // Initialize game objects
    player.init();
    enemies.init();
    projectiles.init();
    scoreboard.init();
    menu.init();

    // Start the game loop
    this.isRunning = true;
    window.requestAnimationFrame(this.gameLoop.bind(this));
  },

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    window.requestAnimationFrame(this.gameLoop.bind(this));

    const deltaTime = currentTime - this.lastTime;
    if (deltaTime < 1000 / this.fps) return;

    this.update(deltaTime);
    this.render();

    this.lastTime = currentTime;
  },

  update(deltaTime) {
    player.update(deltaTime);
    enemies.update(deltaTime);
    projectiles.update(deltaTime);
    collision.check();
    scoreboard.update(deltaTime);
  },

  render() {
    // Render game objects
    player.render();
    enemies.render();
    projectiles.render();
  },

  pause() {
    this.isRunning = false;
    menu.show();
  },

  resume() {
    this.isRunning = true;
    menu.hide();
    this.lastTime = performance.now();
    window.requestAnimationFrame(this.gameLoop.bind(this));
  },

  restart() {
    // Reset game state
    player.reset();
    enemies.reset();
    projectiles.reset();
    scoreboard.reset();
    this.resume();
  },
};

// Start the game when the window loads
window.addEventListener("load", () => game.init());

const game = {
  fps: 60,
  width: window.innerWidth,
  height: window.innerHeight,
  isRunning: false,
  isPaused: false,
  lastTime: 0,
  entities: [],
  score: 0,
  lives: 3,
  level: 1,
  DEBUG: false,

  init() {
    this.canvas = document.getElementById("game-container");
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Initialize game objects
    try {
      this.player = new Player(this.width / 2, this.height - 50);
      this.entities.push(this.player);
      this.enemyController = new EnemyController(this);
      this.projectileController = new ProjectileController(this);
      this.scoreboard = new Scoreboard(this);
      this.menu = new Menu(this);

      // Set up event listeners
      window.addEventListener("keydown", this.handleKeyDown.bind(this));
      window.addEventListener("keyup", this.handleKeyUp.bind(this));
      window.addEventListener("resize", this.handleResize.bind(this));

      // Start the game loop
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  },

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    requestAnimationFrame(this.gameLoop.bind(this));

    const deltaTime = currentTime - this.lastTime;
    if (deltaTime < 1000 / this.fps) return;

    if (!this.isPaused) {
      this.update(deltaTime / 1000); // Convert to seconds
      this.checkCollisions();
    }
    this.render();

    if (this.DEBUG) {
      this.displayFPS(deltaTime);
    }

    this.lastTime = currentTime;
  },

  update(deltaTime) {
    this.entities.forEach((entity) => entity.update(deltaTime));
    this.enemyController.update(deltaTime);
    this.projectileController.update(deltaTime);
    this.scoreboard.update(deltaTime);
  },

  checkCollisions() {
    // Check collisions between entities
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        if (this.entities[i].isCollidingWith(this.entities[j])) {
          this.entities[i].onCollision(this.entities[j]);
          this.entities[j].onCollision(this.entities[i]);
        }
      }
    }
  },

  render() {
    // Clear the canvas
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);

    // Render all entities
    this.entities.forEach((entity) => entity.render(ctx));
    this.enemyController.render(ctx);
    this.projectileController.render(ctx);
    this.scoreboard.render(ctx);

    if (this.isPaused) {
      this.menu.render(ctx);
    }
  },

  pause() {
    this.isPaused = true;
    this.menu.show();
  },

  resume() {
    this.isPaused = false;
    this.menu.hide();
    this.lastTime = performance.now();
  },

  restart() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.entities = [this.player];
    this.player.reset();
    this.enemyController.reset();
    this.projectileController.reset();
    this.scoreboard.reset();
    this.resume();
  },

  handleKeyDown(event) {
    if (event.key === "p" || event.key === "P") {
      this.isPaused ? this.resume() : this.pause();
    } else if (!this.isPaused) {
      this.player.handleKeyDown(event);
    }
  },

  handleKeyUp(event) {
    if (!this.isPaused) {
      this.player.handleKeyUp(event);
    }
  },

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.entities.forEach((entity) => entity.onResize(this.width, this.height));
  },

  addEntity(entity) {
    this.entities.push(entity);
  },

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  },

  displayFPS(deltaTime) {
    const fps = Math.round(1000 / deltaTime);
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
  },

  gameOver() {
    this.isRunning = false;
    alert(`Game Over! Your score: ${this.score}`);
    this.restart();
  },

  levelUp() {
    this.level++;
    this.enemyController.increaseLevel();
    // Add any level-up logic here
  },
};

// Start the game when the window loads
window.addEventListener("load", () => game.init());

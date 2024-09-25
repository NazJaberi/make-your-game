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
      this.menuManager = new MenuManager(this);
      this.collisionManager = new CollisionManager(this);
      this.highScoreManager = new HighScoreManager();

      // Set up event listeners
      window.addEventListener("keydown", this.handleKeyDown.bind(this));
      window.addEventListener("keyup", this.handleKeyUp.bind(this));
      window.addEventListener("resize", this.handleResize.bind(this));
      this.canvas.addEventListener("click", this.handleClick.bind(this));

      // Show main menu
      this.menuManager.showMenu("main");

      // Start the game loop
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  },

  gameLoop(currentTime) {
    requestAnimationFrame(this.gameLoop.bind(this));

    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    if (this.isPaused) {
      this.menuManager.update();
    } else if (this.isRunning) {
      this.update(deltaTime);
      this.collisionManager.checkCollisions();
    }

    this.render();

    if (this.DEBUG) {
      this.displayFPS(deltaTime);
    }
  },

  update(deltaTime) {
    this.entities.forEach((entity) => entity.update(deltaTime));
    this.enemyController.update(deltaTime);
    this.projectileController.update(deltaTime);
    this.scoreboard.update(deltaTime);
  },

  render() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.isRunning) {
      this.entities.forEach((entity) => entity.render(ctx));
      this.enemyController.render(ctx);
      this.projectileController.render(ctx);
      this.scoreboard.render(ctx);
    }

    this.menuManager.render(ctx);
  },

  startGame() {
    this.isRunning = true;
    this.isPaused = false;
    this.reset();
    this.enemyController.init();
  },

  pauseGame() {
    this.isPaused = true;
    this.menuManager.showMenu("pause");
  },

  resumeGame() {
    this.isPaused = false;
    this.menuManager.hideMenu();
  },

  restartGame() {
    this.reset();
    this.startGame();
  },

  endGame() {
    this.isRunning = false;
    const finalScore = this.scoreboard.score;
    this.highScoreManager.addHighScore(prompt("Enter your name:"), finalScore);
    this.menuManager.showMenu("gameOver");
  },

  reset() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.entities = [this.player];
    this.player.reset();
    this.enemyController.reset();
    this.projectileController.reset();
    this.scoreboard.reset();
  },

  handleKeyDown(event) {
    if (event.key === "p" || event.key === "P") {
      this.isPaused ? this.resumeGame() : this.pauseGame();
    } else if (this.isRunning && !this.isPaused) {
      this.player.handleKeyDown(event);
    }
  },

  handleKeyUp(event) {
    if (this.isRunning && !this.isPaused) {
      this.player.handleKeyUp(event);
    }
  },

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.menuManager.handleClick(x, y);
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
    const fps = Math.round(1 / deltaTime);
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
  },

  levelUp() {
    this.level++;
    this.enemyController.increaseLevel();
    // Add any level-up logic here
  },

  addScore(points) {
    this.score += points;
    this.scoreboard.addScore(points);
  },
};

// Start the game when the window loads
window.addEventListener("load", () => game.init());

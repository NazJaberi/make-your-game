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
  DEBUG: true, // Set to true for debugging

  init() {
    this.canvas = document.getElementById("game-container");
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Add these lines to ensure proper canvas sizing
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";

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

      // Replace the old click event listener with this new one
      this.canvas.addEventListener("click", (event) => {
        console.log("Canvas clicked");
        this.handleClick(event);
      });

      // Show main menu
      this.menuManager.showMenu("main");

      // Start the game loop
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));

      // Add this line at the end of the init method
      console.log(
        "Game initialized, canvas size:",
        this.width,
        "x",
        this.height
      );
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
    console.log("Starting game");
    this.isRunning = true;
    this.isPaused = false;
    this.reset();
    this.enemyController.init();
    this.menuManager.hideMenu();
  },

  pauseGame() {
    console.log("Pausing game");
    this.isPaused = true;
    this.menuManager.showMenu("pause");
  },

  resumeGame() {
    console.log("Resuming game");
    this.isPaused = false;
    this.menuManager.hideMenu();
  },

  restartGame() {
    console.log("Restarting game");
    this.reset();
    this.startGame();
  },

  endGame() {
    console.log("Ending game");
    this.isRunning = false;
    const finalScore = this.scoreboard.score;
    this.highScoreManager.addHighScore(prompt("Enter your name:"), finalScore);
    this.menuManager.showMenu("gameOver");
  },

  reset() {
    console.log("Resetting game");
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
    console.log(`Click detected at (${x}, ${y})`);

    if (this.menuManager.isMenuVisible()) {
      console.log("Menu is visible, handling click");
      this.menuManager.handleClick(x, y);
    } else {
      console.log("No menu visible, click not handled");
    }
  },

  handleResize() {
    console.log("Resizing game");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.entities.forEach((entity) => entity.onResize(this.width, this.height));
    this.menuManager.menus.main = new MainMenu(this.menuManager);
    this.menuManager.menus.pause = new PauseMenu(this.menuManager);
    this.menuManager.menus.gameOver = new GameOverMenu(this.menuManager);
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
    console.log(`Leveling up to level ${this.level + 1}`);
    this.level++;
    this.enemyController.increaseLevel();
    // Add any level-up logic here
  },

  addScore(points) {
    this.score += points;
    this.scoreboard.addScore(points);
    console.log(`Score increased by ${points}. New score: ${this.score}`);
  },
};

// Start the game when the window loads
window.addEventListener("load", () => game.init());

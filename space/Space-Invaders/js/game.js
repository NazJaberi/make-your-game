const game = {
  playerTypes: [
    {
      name: "Speedster",
      class: Speedster,
      color: "yellow",
      stats: { speed: 15, fireRate: 2, damage: 3, health: 60, defense: 5 },
    },
    {
      name: "Tank",
      class: Tank,
      color: "blue",
      stats: { speed: 5, fireRate: 1, damage: 7, health: 150, defense: 25 },
    },
    {
      name: "Glass Cannon",
      class: GlassCannon,
      color: "red",
      stats: { speed: 10, fireRate: 3, damage: 7, health: 50, defense: 0 },
    },
    {
      name: "All Rounder",
      class: AllRounder,
      color: "purple",
      stats: { speed: 10, fireRate: 2, damage: 5, health: 100, defense: 10 },
    },
  ],
  selectedPlayerIndex: 0,
  announcements: [],

  assets: {}, // Added assets object to store loaded images

  init() {
    this.canvas = document.getElementById("game-container");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.menuManager = new MenuManager(this);
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.menuManager.showMenu("main");

    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.powerUps = [];
    this.entities = []; // For sidekicks or other entities

    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.comboSystem = new ComboSystem(this);

    this.startTime = 0; // For tracking game duration

    this.canvas.addEventListener("click", this.handleClick.bind(this));
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));

    this.isLeftPressed = false;
    this.isRightPressed = false;
    this.isSpacePressed = false;
    this.isShiftPressed = false;

    // Load assets before starting the game loop
    this.loadAssets(() => {
      this.gameLoop();
    });

    console.log(
      "Game initialized. Canvas size:",
      this.canvas.width,
      "x",
      this.canvas.height
    );
  },

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (this.menuManager.currentMenu) {
      this.menuManager.handleMouseMove(x, y);
    }
  },
  // Asset loading function
  loadAssets(callback) {
    let assetsToLoad = 0;
    let assetsLoaded = 0;

    const images = {
      speedster: "assets/images/speedster.png",
      tank: "assets/images/tank.png",
      glasscannon: "assets/images/glasscannon.png",
      allrounder: "assets/images/allrounder.png",
      sidekick: "assets/images/sidekick.png",

      // Enemy images
      basicDrone: "assets/images/Basic_Drone.png",
      speedyZapper: "assets/images/zapper.png",
      armoredSaucer: "assets/images/saucer.png",
      splittingCube: "assets/images/cube.png",
      shieldedOrb: "assets/images/shielded.png",

      // Boss images
      mothership: "assets/images/mothership.png",
      quantumShifter: "assets/images/Quantum_Shifter.png",
      hiveMind: "assets/images/hive.png",
      technoTitan: "assets/images/titan.png",
      cosmicHydra: "assets/images/hydra.png",

      //background
      background: "assets/images/background.png",
    };

    assetsToLoad = Object.keys(images).length;

    if (assetsToLoad === 0) {
      callback();
      return;
    }

    for (const [key, src] of Object.entries(images)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        assetsLoaded++;
        if (assetsLoaded >= assetsToLoad) {
          callback();
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
      };
      this.assets[key] = img;
    }
  },

  gameLoop(currentTime) {
    if (!this.lastUpdateTime) this.lastUpdateTime = currentTime;
    const deltaTime = currentTime - this.lastUpdateTime;
    this.update(currentTime, deltaTime);
    this.render(currentTime);
    this.lastUpdateTime = currentTime;
    requestAnimationFrame(this.gameLoop.bind(this));
  },

  update(currentTime, deltaTime) {
    if (this.isRunning && !this.isPaused) {
      // Player movement
      if (this.isLeftPressed) {
        this.player.move(-1);
      }
      if (this.isRightPressed) {
        this.player.move(1);
      }

      this.player.update(currentTime);

      this.projectiles.forEach((proj, index) => {
        proj.move();
        if (proj.y < 0 || proj.x < 0 || proj.x > this.canvas.width)
          this.projectiles.splice(index, 1);
      });

      this.enemyProjectiles.forEach((proj, index) => {
        proj.move();
        if (proj.y > this.canvas.height) this.enemyProjectiles.splice(index, 1);
      });

      this.powerUps.forEach((powerUp, index) => {
        powerUp.update();
        if (powerUp.y > this.canvas.height) this.powerUps.splice(index, 1);
      });

      this.entities.forEach((entity) => {
        entity.update(currentTime);
      });

      // Update Enemies
      this.enemies.forEach((enemy, index) => {
        enemy.update(currentTime);
        if (enemy.y > this.canvas.height + 100) {
          this.enemies.splice(index, 1);
          const playerDead = this.player.takeDamage(enemy.damage);
          if (playerDead) {
            this.gameOver();
          }
        }
      });

      this.spawnEnemies(currentTime);
      this.spawnPowerUps();

      this.checkCollisions();

      if (this.isSpacePressed) {
        const newProjectiles = this.player.shoot(currentTime);
        if (newProjectiles) {
          this.projectiles.push(...newProjectiles);
        }
      }

      // Handle special ability activation
      if (this.isShiftPressed) {
        this.player.useSpecialAbility(currentTime);
        this.isShiftPressed = false;
      }

      // Update combo system
      this.comboSystem.update(currentTime);

      // Update announcements
      this.updateAnnouncements(currentTime);
    }
  },

  render(currentTime) {
    // Clear canvas
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isRunning && !this.isPaused) {
      // Draw background image if available
      if (this.assets.background) {
        this.ctx.drawImage(
          this.assets.background,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
      }

      this.player.render(this.ctx);
      this.enemies.forEach((enemy) => enemy.render(this.ctx));
      this.projectiles.forEach((proj) => proj.render(this.ctx));
      this.enemyProjectiles.forEach((proj) => proj.render(this.ctx));
      this.powerUps.forEach((powerUp) => powerUp.render(this.ctx));
      this.entities.forEach((entity) => entity.render(this.ctx));

      // Display HUD
      this.ctx.fillStyle = "white";
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`Score: ${this.score}`, 10, 30);
      this.ctx.fillText(
        `Health: ${Math.max(0, Math.floor(this.player.health))}`,
        10,
        60
      );

      // Render special ability cooldown
      const cooldownPercentage =
        this.player.getSpecialCooldownPercentage(currentTime);
      this.ctx.fillStyle = cooldownPercentage === 1 ? "green" : "red";
      this.ctx.fillRect(10, 90, 100 * cooldownPercentage, 10);
      this.ctx.strokeStyle = "white";
      this.ctx.strokeRect(10, 90, 100, 10);
      this.ctx.fillStyle = "white";
      this.ctx.fillText("Special", 120, 100);

      // Render combo system
      this.comboSystem.render(this.ctx);

      // Render announcements
      this.renderAnnouncements();
    }

    if (this.menuManager.currentMenu) {
      this.menuManager.render(this.ctx);
    }
  },

  addAnnouncement(message, duration = 3000) {
    this.announcements.push(new Announcement(message, duration));
  },

  updateAnnouncements(currentTime) {
    this.announcements = this.announcements.filter((announcement) =>
      announcement.update(currentTime)
    );
  },

  renderAnnouncements() {
    this.announcements.forEach((announcement) =>
      announcement.render(this.ctx, this.canvas.width, this.canvas.height)
    );
  },

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(`Click detected at (${x}, ${y})`);

    if (this.menuManager.currentMenu) {
      this.menuManager.handleClick(x, y);
    }
  },

  handleKeyDown(event) {
    if (this.isRunning && !this.isPaused) {
      if (event.key === "ArrowLeft" || event.key === "a") {
        this.isLeftPressed = true;
      } else if (event.key === "ArrowRight" || event.key === "d") {
        this.isRightPressed = true;
      } else if (event.key === " ") {
        this.isSpacePressed = true;
      } else if (event.key === "Shift") {
        this.isShiftPressed = true;
      }
    }
    if (event.key === "Escape") {
      this.togglePause();
    }
  },

  handleKeyUp(event) {
    if (event.key === "ArrowLeft" || event.key === "a") {
      this.isLeftPressed = false;
    } else if (event.key === "ArrowRight" || event.key === "d") {
      this.isRightPressed = false;
    } else if (event.key === " ") {
      this.isSpacePressed = false;
    } else if (event.key === "Shift") {
      this.isShiftPressed = false;
    }
  },

  showCharacterSelect() {
    this.menuManager.showMenu("characterSelect");
  },

  startGame() {
    console.log("Starting game");
    this.isRunning = true;
    this.isPaused = false;
    this.menuManager.hideMenu();
    this.score = 0;
    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.powerUps = [];
    this.entities = [];
    this.comboSystem = new ComboSystem(this);
    this.startTime = performance.now();

    const PlayerClass = this.playerTypes[this.selectedPlayerIndex].class;
    this.player = new PlayerClass(
      this.canvas.width / 2,
      this.canvas.height - 100
    );
    this.player.game = this; // Set reference to game
    this.entities.push(this.player);

    // Reset timers
    this.lastEnemySpawnTime = 0;
    this.lastBossSpawnTime = 0;
    this.lastPowerUpSpawnTime = 0;

    // Status effects
    this.isMindControlled = false;
    this.isEMPDissed = false;
    this.timeWarpActive = false;
  },

  togglePause() {
    if (this.isRunning) {
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    }
  },

  pauseGame() {
    this.isPaused = true;
    this.menuManager.showMenu("pause");
    console.log("Game paused");
  },

  resumeGame() {
    this.isPaused = false;
    this.menuManager.hideMenu();
    console.log("Game resumed");
  },

  gameOver() {
    this.isRunning = false;
    this.addAnnouncement("Game Over", 5000);
    this.menuManager.showMenu("gameOver");
    console.log("Game over");
  },

  returnToMainMenu() {
    this.isRunning = false;
    this.isPaused = false;
    this.menuManager.showMenu("main");
    console.log("Returned to main menu");
  },

  checkCollisions() {
    // Check projectile-enemy collisions
    for (let pIndex = this.projectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.projectiles[pIndex];
      let projectileRemoved = false;
      for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = this.enemies[eIndex];

        if (this.isColliding(proj, enemy)) {
          if (!proj.piercing) {
            this.projectiles.splice(pIndex, 1);
            projectileRemoved = true;
          }

          const enemyDead = enemy.takeDamage(proj.damage);
          if (enemyDead) {
            // Handle Splitting Cube
            if (enemy instanceof SplittingCube && enemy.size > 20) {
              this.addEnemy(
                new SplittingCube(enemy.x - 10, enemy.y, enemy.size / 2)
              );
              this.addEnemy(
                new SplittingCube(enemy.x + 10, enemy.y, enemy.size / 2)
              );
            }
            this.enemies.splice(eIndex, 1);
            this.score += (enemy.isBoss ? 100 : 10) * this.getScoreMultiplier();
            this.comboSystem.incrementCombo();

            // Chance to drop a power-up
            if (Math.random() < 0.1) {
              this.spawnPowerUp(enemy.x, enemy.y);
            }
          }

          if (proj.splash) {
            // Deal splash damage to nearby enemies
            this.enemies.forEach((nearbyEnemy) => {
              if (
                nearbyEnemy !== enemy &&
                this.getDistance(enemy, nearbyEnemy) < 50
              ) {
                nearbyEnemy.takeDamage(proj.damage / 2);
              }
            });
          }

          if (projectileRemoved) break;
        }
      }
      if (projectileRemoved) continue;
    }

    // Check player-enemy collisions
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];

      if (this.isColliding(enemy, this.player)) {
        this.enemies.splice(eIndex, 1);
        const playerDead = this.player.takeDamage(enemy.damage);
        if (playerDead) {
          this.gameOver();
        } else {
          this.comboSystem.resetCombo();
        }
      }
    }

    // Check enemy projectile collisions with player
    for (let pIndex = this.enemyProjectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.enemyProjectiles[pIndex];
      if (this.isColliding(proj, this.player)) {
        this.enemyProjectiles.splice(pIndex, 1);
        const playerDead = this.player.takeDamage(proj.damage);
        if (playerDead) {
          this.gameOver();
        } else {
          this.comboSystem.resetCombo();
        }
      }
    }

    // Check player-powerUp collisions
    for (let pIndex = this.powerUps.length - 1; pIndex >= 0; pIndex--) {
      const powerUp = this.powerUps[pIndex];
      if (this.isColliding(powerUp, this.player)) {
        this.powerUps.splice(pIndex, 1);
        this.player.activatePowerUp(powerUp);
        this.addAnnouncement(`${powerUp.type} activated!`);
      }
    }
  },

  isColliding(rect1, rect2) {
    return !(
      rect1.x + rect1.width / 2 < rect2.x - rect2.width / 2 ||
      rect1.x - rect1.width / 2 > rect2.x + rect2.width / 2 ||
      rect1.y + rect1.height / 2 < rect2.y - rect2.height / 2 ||
      rect1.y - rect1.height / 2 > rect2.y + rect2.height / 2
    );
  },

  addEnemy(enemy) {
    enemy.game = this;
    this.enemies.push(enemy);
  },

  spawnEnemies(currentTime) {
    const elapsedMinutes = (currentTime - this.startTime) / 60000;

    // Gradually increase spawn rate
    let spawnInterval = Math.max(2000 - elapsedMinutes * 100, 500);
    if (!this.lastEnemySpawnTime) this.lastEnemySpawnTime = currentTime;

    if (currentTime - this.lastEnemySpawnTime >= spawnInterval) {
      // Spawn Basic Drone
      this.addEnemy(new BasicDrone(Math.random() * this.canvas.width, -50));
      this.lastEnemySpawnTime = currentTime;
    }

    // Introduce new enemies at specific times
    if (elapsedMinutes >= 1 && Math.random() < 0.02) {
      // Speedy Zapper
      this.addEnemy(new SpeedyZapper(Math.random() * this.canvas.width, -50));
    }

    if (elapsedMinutes >= 2 && Math.random() < 0.01) {
      // Armored Saucer
      this.addEnemy(new ArmoredSaucer(Math.random() * this.canvas.width, -50));
    }

    if (elapsedMinutes >= 3 && Math.random() < 0.005) {
      // Splitting Cube
      this.addEnemy(new SplittingCube(Math.random() * this.canvas.width, -50));
    }

    if (elapsedMinutes >= 4 && Math.random() < 0.002) {
      // Shielded Orb
      this.addEnemy(new ShieldedOrb(Math.random() * this.canvas.width, -50));
    }

    if (elapsedMinutes >= 2) {
      if (
        !this.lastBossSpawnTime ||
        currentTime - this.lastBossSpawnTime >= 120000 + Math.random() * 60000 // 2-3 minutes
      ) {
        this.spawnBoss();
        this.lastBossSpawnTime = currentTime;
      }
    }
  },

  spawnBoss() {
    const bosses = [
      Mothership,
      QuantumShifter,
      HiveMind,
      TechnoTitan,
      CosmicHydra,
    ];
    const BossClass = bosses[Math.floor(Math.random() * bosses.length)];
    const boss = new BossClass(this.canvas.width / 2, -150);
    boss.game = this;
    this.enemies.push(boss);
    this.addAnnouncement(`${boss.name} has appeared!`, 5000);
  },

  spawnPowerUp(x, y) {
    const rand = Math.random();
    let powerUp;
    if (rand < 0.1) {
      powerUp = new RapidFirePowerUp(x, y, this.player);
    } else if (rand < 0.2) {
      powerUp = new SpreadShotPowerUp(x, y, this.player);
    } else if (rand < 0.3) {
      powerUp = new ShieldBubblePowerUp(x, y, this.player);
    } else if (rand < 0.4) {
      powerUp = new PiercingShotPowerUp(x, y, this.player);
    } else if (rand < 0.5) {
      powerUp = new HealthPack(x, y, this.player);
    } else if (rand < 0.6) {
      powerUp = new BombPowerUp(x, y, this);
    } else if (rand < 0.7) {
      powerUp = new SidekickPowerUp(x, y, this.player, this);
    } else if (rand < 0.8) {
      powerUp = new MagnetPowerUp(x, y, this.player);
    } else if (rand < 0.9) {
      powerUp = new UltimateChargePowerUp(x, y, this.player);
    } else {
      powerUp = new TimeWarpPowerUp(x, y, this);
    }
    this.powerUps.push(powerUp);
  },
  spawnPowerUps() {
    if (!this.lastPowerUpSpawnTime) this.lastPowerUpSpawnTime = 0;
    if (
      performance.now() - this.lastPowerUpSpawnTime >
      20000 + Math.random() * 10000
    ) {
      this.spawnPowerUp(Math.random() * this.canvas.width, -50);
      this.lastPowerUpSpawnTime = performance.now();
    }
  },
  releaseEnergyWave() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      const enemyDead = enemy.takeDamage(20);
      if (enemyDead) {
        this.enemies.splice(eIndex, 1);
        this.score += enemy.isBoss ? 100 : 10;
      }
    }
  },

  clearRegularEnemies() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      if (!enemy.isBoss) {
        this.enemies.splice(eIndex, 1);
        this.score += 10 * this.getScoreMultiplier();
      }
    }
  },

  fireLaserBeam(enemy) {
    this.addAnnouncement(`${enemy.name} fires a laser beam!`);
    console.log("Laser Beam fired!");
    const laserBeam = {
      x: enemy.x,
      y: enemy.y,
      width: 10,
      height: this.canvas.height,
      damage: 30,
      duration: 2000, // 2 seconds
    };

    // Render laser beam
    const renderLaser = () => {
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
      this.ctx.fillRect(
        laserBeam.x - laserBeam.width / 2,
        laserBeam.y,
        laserBeam.width,
        laserBeam.height
      );
    };

    // Check collision with player
    const checkLaserCollision = () => {
      if (this.isColliding(this.player, laserBeam)) {
        const playerDead = this.player.takeDamage(laserBeam.damage);
        if (playerDead) {
          this.gameOver();
        } else {
          this.comboSystem.resetCombo();
        }
      }
    };

    // Animate laser beam
    const laserInterval = setInterval(() => {
      renderLaser();
      checkLaserCollision();
    }, 16); // 60 FPS

    // Stop laser after duration
    setTimeout(() => {
      clearInterval(laserInterval);
    }, laserBeam.duration);
  },

  createBlackHole(enemy) {
    this.addAnnouncement(`${enemy.name} creates a black hole!`);
    console.log("Black Hole created!");
    const blackHole = {
      x: enemy.x,
      y: enemy.y + enemy.height / 2,
      radius: 30,
      pullForce: 0.5,
      duration: 5000, // 5 seconds
    };

    // Render black hole
    const renderBlackHole = () => {
      this.ctx.beginPath();
      this.ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      this.ctx.fill();
    };

    // Pull player towards black hole
    const pullPlayer = () => {
      const dx = blackHole.x - this.player.x;
      const dy = blackHole.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        this.player.x += (dx / distance) * blackHole.pullForce;
        this.player.y += (dy / distance) * blackHole.pullForce;
      }
    };

    // Animate black hole
    const blackHoleInterval = setInterval(() => {
      renderBlackHole();
      pullPlayer();
    }, 16); // 60 FPS

    // Stop black hole after duration
    setTimeout(() => {
      clearInterval(blackHoleInterval);
    }, blackHole.duration);
  },

  activateMindControl() {
    console.log("Mind Control activated!");
    this.isMindControlled = true;

    // Visual effect for mind control
    const mindControlEffect = () => {
      this.addAnnouncement("Mind Control activated!");
      this.ctx.fillStyle = "rgba(255, 0, 255, 0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    const mindControlInterval = setInterval(mindControlEffect, 16); // 60 FPS

    setTimeout(() => {
      this.isMindControlled = false;
      clearInterval(mindControlInterval);
    }, 5000);
  },

  activateEMP() {
    this.addAnnouncement("EMP activated!");
    console.log("EMP activated!");
    this.isEMPDissed = true;

    // Visual effect for EMP
    const empEffect = () => {
      this.ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y, 100, 0, Math.PI * 2);
      this.ctx.stroke();
    };

    const empInterval = setInterval(empEffect, 16); // 60 FPS

    setTimeout(() => {
      this.isEMPDissed = false;
      clearInterval(empInterval);
    }, 10000);
  },

  fireHomingMissiles(enemy) {
    this.addAnnouncement(`${enemy.name} launches homing missiles!`);
    console.log("Homing Missiles fired!");
    const missileCount = 3;

    for (let i = 0; i < missileCount; i++) {
      const missile = new EnemyProjectile(
        enemy.x,
        enemy.y + enemy.height / 2,
        15,
        3,
        this
      );
      missile.isHoming = true;
      missile.homingStrength = 0.05;
      missile.update = function () {
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
      };
      missile.render = function (ctx) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
      };
      this.enemyProjectiles.push(missile);
    }
  },

  getDistance(obj1, obj2) {
    return Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
  },

  getScoreMultiplier() {
    switch (this.comboSystem.comboLevel) {
      case 2:
        return 1.5;
      case 3:
        return 2;
      case 4:
        return 3;
      case 5:
        return 4;
      default:
        return 1;
    }
  },
};

// Start the game after the window loads
window.addEventListener("load", () => game.init());

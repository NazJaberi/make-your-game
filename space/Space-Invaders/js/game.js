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
  assets: {},

  init() {
    this.container = document.getElementById("game-container");
    this.container.style.width = `${window.innerWidth}px`;
    this.container.style.height = `${window.innerHeight}px`;

    this.menuManager = new MenuManager(this);
    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
    this.menuManager.showMenu("main");

    this.enemies = [];
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.powerUps = [];
    this.entities = [];

    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.comboSystem = new ComboSystem(this);

    this.startTime = 0;

    this.container.addEventListener("click", this.handleClick.bind(this));
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));

    this.isLeftPressed = false;
    this.isRightPressed = false;
    this.isSpacePressed = false;
    this.isShiftPressed = false;

    this.loadAssets(() => {
      this.gameLoop();
    });

    console.log(
      "Game initialized. Container size:",
      this.container.offsetWidth,
      "x",
      this.container.offsetHeight
    );
  },

  handleMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (this.menuManager.currentMenu) {
      this.menuManager.handleMouseMove(x, y);
    }
  },

  loadAssets(callback) {
    let assetsToLoad = 0;
    let assetsLoaded = 0;

    const images = {
      speedster: "assets/images/speedster.png",
      tank: "assets/images/tank.png",
      glasscannon: "assets/images/glasscannon.png",
      allrounder: "assets/images/allrounder.png",
      sidekick: "assets/images/sidekick.png",
      basicDrone: "assets/images/Basic_Drone.png",
      speedyZapper: "assets/images/zapper.png",
      armoredSaucer: "assets/images/saucer.png",
      splittingCube: "assets/images/cube.png",
      shieldedOrb: "assets/images/shielded.png",
      mothership: "assets/images/mothership.png",
      quantumShifter: "assets/images/Quantum_Shifter.png",
      hiveMind: "assets/images/hive.png",
      technoTitan: "assets/images/titan.png",
      cosmicHydra: "assets/images/hydra.png",
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
    this.lastUpdateTime = currentTime;
    requestAnimationFrame(this.gameLoop.bind(this));
  },

  update(currentTime, deltaTime) {
    if (this.isRunning && !this.isPaused) {
      if (this.isLeftPressed) {
        this.player.move(-1);
      }
      if (this.isRightPressed) {
        this.player.move(1);
      }

      this.player.update(currentTime);

      this.updateProjectiles();
      this.updateEnemyProjectiles();
      this.updatePowerUps();
      this.updateEntities(currentTime);
      this.updateEnemies(currentTime);

      this.spawnEnemies(currentTime);
      this.spawnPowerUps();

      this.checkCollisions();

      if (this.isSpacePressed) {
        const newProjectiles = this.player.shoot(currentTime);
        if (newProjectiles) {
          this.projectiles.push(...newProjectiles);
          newProjectiles.forEach((proj) =>
            this.container.appendChild(proj.element)
          );
        }
      }

      if (this.isShiftPressed) {
        this.player.useSpecialAbility(currentTime);
        this.isShiftPressed = false;
      }

      this.comboSystem.update(currentTime);
      this.updateAnnouncements(currentTime);
      this.updateHUD();
    }
  },

  updateProjectiles() {
    this.projectiles.forEach((proj, index) => {
      proj.move();
      if (proj.y < 0 || proj.x < 0 || proj.x > this.container.offsetWidth) {
        proj.element.remove();
        this.projectiles.splice(index, 1);
      } else {
        proj.element.style.left = `${proj.x}px`;
        proj.element.style.top = `${proj.y}px`;
      }
    });
  },

  updateEnemyProjectiles() {
    this.enemyProjectiles.forEach((proj, index) => {
      proj.move();
      if (proj.y > this.container.offsetHeight) {
        proj.element.remove();
        this.enemyProjectiles.splice(index, 1);
      } else {
        proj.element.style.left = `${proj.x}px`;
        proj.element.style.top = `${proj.y}px`;
      }
    });
  },

  updatePowerUps() {
    this.powerUps.forEach((powerUp, index) => {
      powerUp.update();
      if (powerUp.y > this.container.offsetHeight) {
        powerUp.element.remove();
        this.powerUps.splice(index, 1);
      } else {
        powerUp.element.style.left = `${powerUp.x}px`;
        powerUp.element.style.top = `${powerUp.y}px`;
      }
    });
  },

  updateEntities(currentTime) {
    this.entities.forEach((entity) => {
      entity.update(currentTime);
      entity.element.style.left = `${entity.x}px`;
      entity.element.style.top = `${entity.y}px`;
    });
  },

  updateEnemies(currentTime) {
    this.enemies.forEach((enemy, index) => {
      enemy.update(currentTime);
      if (enemy.y > this.container.offsetHeight + 100) {
        enemy.element.remove();
        this.enemies.splice(index, 1);
        const playerDead = this.player.takeDamage(enemy.damage);
        if (playerDead) {
          this.gameOver();
        }
      } else {
        enemy.element.style.left = `${enemy.x}px`;
        enemy.element.style.top = `${enemy.y}px`;
      }
    });
  },

  updateHUD() {
    document.getElementById("score").textContent = `Score: ${this.score}`;
    document.getElementById("health").textContent = `Health: ${Math.max(
      0,
      Math.floor(this.player.health)
    )}`;

    const cooldownPercentage = this.player.getSpecialCooldownPercentage(
      performance.now()
    );
    const specialCooldown = document.getElementById("special-cooldown");
    specialCooldown.style.width = `${cooldownPercentage * 100}%`;
    specialCooldown.style.backgroundColor =
      cooldownPercentage === 1 ? "green" : "red";
  },

  addAnnouncement(message, duration = 3000) {
    const announcement = document.createElement("div");
    announcement.className = "announcement";
    announcement.textContent = message;
    this.container.appendChild(announcement);
    setTimeout(() => announcement.remove(), duration);
  },

  updateAnnouncements(currentTime) {
    // No need to update DOM-based announcements
  },

  handleClick(event) {
    const rect = this.container.getBoundingClientRect();
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
      this.container.offsetWidth / 2,
      this.container.offsetHeight - 100
    );
    this.player.game = this;
    this.entities.push(this.player);
    this.container.appendChild(this.player.element);

    this.lastEnemySpawnTime = 0;
    this.lastBossSpawnTime = 0;
    this.lastPowerUpSpawnTime = 0;

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
    this.checkProjectileEnemyCollisions();
    this.checkPlayerEnemyCollisions();
    this.checkEnemyProjectilePlayerCollisions();
    this.checkPlayerPowerUpCollisions();
  },

  checkProjectileEnemyCollisions() {
    for (let pIndex = this.projectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.projectiles[pIndex];
      let projectileRemoved = false;
      for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
        const enemy = this.enemies[eIndex];

        if (this.isColliding(proj, enemy)) {
          if (!proj.piercing) {
            proj.element.remove();
            this.projectiles.splice(pIndex, 1);
            projectileRemoved = true;
          }

          const enemyDead = enemy.takeDamage(proj.damage);
          if (enemyDead) {
            if (enemy instanceof SplittingCube && enemy.size > 20) {
              this.addEnemy(
                new SplittingCube(enemy.x - 10, enemy.y, enemy.size / 2)
              );
              this.addEnemy(
                new SplittingCube(enemy.x + 10, enemy.y, enemy.size / 2)
              );
            }
            enemy.element.remove();
            this.enemies.splice(eIndex, 1);
            this.score += (enemy.isBoss ? 100 : 10) * this.getScoreMultiplier();
            this.comboSystem.incrementCombo();

            if (Math.random() < 0.1) {
              this.spawnPowerUp(enemy.x, enemy.y);
            }
          }

          if (proj.splash) {
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
  },

  checkPlayerEnemyCollisions() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];

      if (this.isColliding(enemy, this.player)) {
        enemy.element.remove();
        this.enemies.splice(eIndex, 1);
        const playerDead = this.player.takeDamage(enemy.damage);
        if (playerDead) {
          this.gameOver();
        } else {
          this.comboSystem.resetCombo();
        }
      }
    }
  },

  checkEnemyProjectilePlayerCollisions() {
    for (let pIndex = this.enemyProjectiles.length - 1; pIndex >= 0; pIndex--) {
      const proj = this.enemyProjectiles[pIndex];
      if (this.isColliding(proj, this.player)) {
        proj.element.remove();
        this.enemyProjectiles.splice(pIndex, 1);
        const playerDead = this.player.takeDamage(proj.damage);
        if (playerDead) {
          this.gameOver();
        } else {
          this.comboSystem.resetCombo();
        }
      }
    }
  },

  checkPlayerPowerUpCollisions() {
    for (let pIndex = this.powerUps.length - 1; pIndex >= 0; pIndex--) {
      const powerUp = this.powerUps[pIndex];
      if (this.isColliding(powerUp, this.player)) {
        powerUp.element.remove();
        this.powerUps.splice(pIndex, 1);
        this.player.activatePowerUp(powerUp);
        this.addAnnouncement(`${powerUp.type} activated!`);
      }
    }
  },

  isColliding(rect1, rect2) {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  },

  addEnemy(enemy) {
    enemy.game = this;
    this.enemies.push(enemy);
    this.container.appendChild(enemy.element);
  },

  spawnEnemies(currentTime) {
    const elapsedMinutes = (currentTime - this.startTime) / 60000;
    let spawnInterval = Math.max(2000 - elapsedMinutes * 100, 500);
    if (!this.lastEnemySpawnTime) this.lastEnemySpawnTime = currentTime;

    if (currentTime - this.lastEnemySpawnTime >= spawnInterval) {
      this.addEnemy(
        new BasicDrone(Math.random() * this.container.offsetWidth, -50)
      );
      this.lastEnemySpawnTime = currentTime;
    }

    if (elapsedMinutes >= 1 && Math.random() < 0.02) {
      this.addEnemy(
        new SpeedyZapper(Math.random() * this.container.offsetWidth, -50)
      );
    }

    if (elapsedMinutes >= 2 && Math.random() < 0.01) {
      this.addEnemy(
        new ArmoredSaucer(Math.random() * this.container.offsetWidth, -50)
      );
    }

    if (elapsedMinutes >= 3 && Math.random() < 0.005) {
      this.addEnemy(
        new SplittingCube(Math.random() * this.container.offsetWidth, -50)
      );
    }

    if (elapsedMinutes >= 4 && Math.random() < 0.002) {
      this.addEnemy(
        new ShieldedOrb(Math.random() * this.container.offsetWidth, -50)
      );
    }

    if (elapsedMinutes >= 2) {
      if (
        !this.lastBossSpawnTime ||
        currentTime - this.lastBossSpawnTime >= 120000 + Math.random() * 60000
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
    const boss = new BossClass(this.container.offsetWidth / 2, -150);
    boss.game = this;
    this.enemies.push(boss);
    this.container.appendChild(boss.element);
    this.addAnnouncement(`${boss.name} has appeared!`, 5000);
  },

  spawnPowerUp(x, y) {
    const rand = Math.random();
    let powerUp;
    if (rand < 0.1) powerUp = new RapidFirePowerUp(x, y, this.player);
    else if (rand < 0.2) powerUp = new SpreadShotPowerUp(x, y, this.player);
    else if (rand < 0.3) powerUp = new ShieldBubblePowerUp(x, y, this.player);
    else if (rand < 0.4) powerUp = new PiercingShotPowerUp(x, y, this.player);
    else if (rand < 0.5) powerUp = new HealthPack(x, y, this.player);
    else if (rand < 0.6) powerUp = new BombPowerUp(x, y, this);
    else if (rand < 0.7) powerUp = new SidekickPowerUp(x, y, this.player, this);
    else if (rand < 0.8) powerUp = new MagnetPowerUp(x, y, this.player);
    else if (rand < 0.9) powerUp = new UltimateChargePowerUp(x, y, this.player);
    else powerUp = new TimeWarpPowerUp(x, y, this);

    this.powerUps.push(powerUp);
    this.container.appendChild(powerUp.element);
  },

  spawnPowerUps() {
    if (!this.lastPowerUpSpawnTime) this.lastPowerUpSpawnTime = 0;
    if (
      performance.now() - this.lastPowerUpSpawnTime >
      20000 + Math.random() * 10000
    ) {
      this.spawnPowerUp(Math.random() * this.container.offsetWidth, -50);
      this.lastPowerUpSpawnTime = performance.now();
    }
  },

  releaseEnergyWave() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      const enemyDead = enemy.takeDamage(20);
      if (enemyDead) {
        enemy.element.remove();
        this.enemies.splice(eIndex, 1);
        this.score += enemy.isBoss ? 100 : 10;
      }
    }
  },

  clearRegularEnemies() {
    for (let eIndex = this.enemies.length - 1; eIndex >= 0; eIndex--) {
      const enemy = this.enemies[eIndex];
      if (!enemy.isBoss) {
        enemy.element.remove();
        this.enemies.splice(eIndex, 1);
        this.score += 10 * this.getScoreMultiplier();
      }
    }
  },

  fireLaserBeam(enemy) {
    this.addAnnouncement(`${enemy.name} fires a laser beam!`);
    console.log("Laser Beam fired!");
    const laserBeam = document.createElement("div");
    laserBeam.className = "laser-beam";
    laserBeam.style.left = `${enemy.x}px`;
    laserBeam.style.top = `${enemy.y}px`;
    laserBeam.style.height = `${this.container.offsetHeight}px`;
    this.container.appendChild(laserBeam);

    const checkLaserCollision = () => {
      if (this.isColliding(this.player, laserBeam)) {
        const playerDead = this.player.takeDamage(30);
        if (playerDead) {
          this.gameOver();
        } else {
          this.comboSystem.resetCombo();
        }
      }
    };

    const laserInterval = setInterval(checkLaserCollision, 16);

    setTimeout(() => {
      clearInterval(laserInterval);
      laserBeam.remove();
    }, 2000);
  },

  createBlackHole(enemy) {
    this.addAnnouncement(`${enemy.name} creates a black hole!`);
    console.log("Black Hole created!");
    const blackHole = document.createElement("div");
    blackHole.className = "black-hole";
    blackHole.style.left = `${enemy.x}px`;
    blackHole.style.top = `${enemy.y + enemy.height / 2}px`;
    this.container.appendChild(blackHole);

    const pullPlayer = () => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y + enemy.height / 2 - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        this.player.x += (dx / distance) * 0.5;
        this.player.y += (dy / distance) * 0.5;
        this.player.element.style.left = `${this.player.x}px`;
        this.player.element.style.top = `${this.player.y}px`;
      }
    };

    const blackHoleInterval = setInterval(pullPlayer, 16);

    setTimeout(() => {
      clearInterval(blackHoleInterval);
      blackHole.remove();
    }, 5000);
  },

  activateMindControl() {
    console.log("Mind Control activated!");
    this.isMindControlled = true;
    this.addAnnouncement("Mind Control activated!");

    const mindControlOverlay = document.createElement("div");
    mindControlOverlay.className = "mind-control-overlay";
    this.container.appendChild(mindControlOverlay);

    setTimeout(() => {
      this.isMindControlled = false;
      mindControlOverlay.remove();
    }, 5000);
  },

  activateEMP() {
    this.addAnnouncement("EMP activated!");
    console.log("EMP activated!");
    this.isEMPDissed = true;

    const empEffect = document.createElement("div");
    empEffect.className = "emp-effect";
    empEffect.style.left = `${this.player.x}px`;
    empEffect.style.top = `${this.player.y}px`;
    this.container.appendChild(empEffect);

    setTimeout(() => {
      this.isEMPDissed = false;
      empEffect.remove();
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
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
      };
      this.enemyProjectiles.push(missile);
      this.container.appendChild(missile.element);
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

window.addEventListener("load", () => game.init());

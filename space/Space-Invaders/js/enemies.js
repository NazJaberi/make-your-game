// enemies.js

class BaseEnemy {
  constructor(x, y, stats) {
    this.game = null; // Will be set when enemy is created
    this.x = x;
    this.y = y;
    this.width = stats.width || 70;
    this.height = stats.height || 70;
    this.speed = stats.speed || 1;
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.damage = stats.damage || 10;
    this.color = stats.color || "green";
    this.isInvulnerable = false;
    this.lastAbilityTime = 0;
    this.lastShotTime = 0;
    this.fireRate = stats.fireRate || 0.5; // Default enemy fire rate
    this.imageKey = stats.imageKey || null; // Key to access the image in game.assets

    // Create DOM element
    this.element = document.createElement("div");
    this.element.className = "enemy";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundSize = "contain";
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.backgroundPosition = "center";

    // Create health bar
    this.healthBar = document.createElement("div");
    this.healthBar.className = "enemy-health-bar";
    this.healthBar.style.position = "absolute";
    this.healthBar.style.top = "-10px";
    this.healthBar.style.left = "0";
    this.healthBar.style.width = "100%";
    this.healthBar.style.height = "5px";
    this.healthBar.style.backgroundColor = "red";
    this.element.appendChild(this.healthBar);
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    this.health -= amount;
    this.updateHealthBar();
    return this.health <= 0;
  }

  updateHealthBar() {
    this.healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
  }

  render() {
    if (this.game.assets[this.imageKey]) {
      this.element.style.backgroundImage = `url(${this.game.assets[this.imageKey].src})`;
    } else {
      this.element.style.backgroundColor = this.color;
    }
    this.element.style.left = `${this.x - this.width / 2}px`;
    this.element.style.top = `${this.y - this.height / 2}px`;

    this.element.classList.toggle("invulnerable", this.isInvulnerable);
  }

  move() {
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      const projectileWidth = 5; // Assuming projectile width is 5px

      // Calculate spawn position at the right edge
      const spawnX = this.x + (this.width / 2) + (projectileWidth / 2);
      const spawnY = this.y + this.height / 2; // Bottom of the enemy

      // Create projectile with angle = Math.PI / 2 (straight down)
      const proj = new EnemyProjectile(
        spawnX,
        spawnY,
        this.damage,
        5,
        this.game,
        Math.PI / 2
      );

      // Add to game
      this.game.enemyProjectiles.push(proj);
      this.game.container.appendChild(proj.element);
    }
  }

  update(currentTime) {
    this.move();
    this.shoot(currentTime);
    this.render();
  }
}

class BasicDrone extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 10, // Reduced health
      speed: 0.8, // Reduced speed
      damage: 5,  // Reduced damage
      color: "green",
      fireRate: 0.1, // Reduced fire rate
      imageKey: "basicDrone",
    });
  }
}

class SpeedyZapper extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 8,  // Reduced health
      speed: 1.5, // Reduced speed
      damage: 3,  // Reduced damage
      color: "cyan",
      fireRate: 0.15, // Reduced fire rate
      imageKey: "speedyZapper",
    });
    this.amplitude = 50;
    this.frequency = 0.05;
    this.startX = x;
    this.age = 0;
  }

  move() {
    this.age++;
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
    this.x = this.startX + this.amplitude * Math.sin(this.frequency * this.age);
  }
}

class ArmoredSaucer extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 20, // Reduced health
      speed: 0.4, // Reduced speed
      damage: 8,  // Reduced damage
      color: "gray",
      fireRate: 0.05, // Reduced fire rate
      imageKey: "armoredSaucer",
    });
  }

  takeDamage(amount) {
    // Reduces damage by half (simulate armor)
    return super.takeDamage(amount / 2);
  }
}

class SplittingCube extends BaseEnemy {
  constructor(x, y, size = 40) {
    super(x, y, {
      health: size === 40 ? 15 : 8, // Reduced health
      speed: 0.5, // Reduced speed
      damage: 5,  // Reduced damage
      color: "orange",
      width: size,
      height: size,
      fireRate: 0,
      imageKey: "splittingCube",
    });
    this.size = size;
  }
}

class ShieldedOrb extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 12, // Reduced health
      speed: 0.8, // Reduced speed
      damage: 5,  // Reduced damage
      color: "violet",
      fireRate: 0.1, // Reduced fire rate
      imageKey: "shieldedOrb",
    });
    this.shieldDuration = 1500; // Reduced shield duration
    this.shieldCooldown = 3000; // Reduced cooldown
    this.isShielded = false;
    this.lastShieldTime = 0;

    // Create shield element
    this.shieldElement = document.createElement("div");
    this.shieldElement.className = "enemy-shield";
    this.shieldElement.style.display = "none";
    this.element.appendChild(this.shieldElement);
  }

  update(currentTime) {
    super.update(currentTime);
    if (
      currentTime - this.lastShieldTime >=
      this.shieldCooldown + this.shieldDuration
    ) {
      this.isShielded = true;
      this.isInvulnerable = true;
      this.lastShieldTime = currentTime;
      this.shieldElement.style.display = "block";
      setTimeout(() => {
        this.isShielded = false;
        this.isInvulnerable = false;
        this.shieldElement.style.display = "none";
      }, this.shieldDuration);
    }
  }
}

// Boss Classes
class BossEnemy extends BaseEnemy {
  constructor(x, y, stats) {
    super(x, y, stats);
    this.isBoss = true;
    this.imageKey = stats.imageKey || null;
    this.name = stats.name || "Boss";

    // Create name label
    this.nameLabel = document.createElement("div");
    this.nameLabel.className = "boss-name";
    this.nameLabel.textContent = this.name;
    this.element.appendChild(this.nameLabel);
  }
}

class Mothership extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 300, // Reduced health
      speed: 0.2,  // Reduced speed
      damage: 15,  // Reduced damage
      color: "maroon",
      width: 100,
      height: 100,
      imageKey: "mothership",
      name: "Mothership",
    });
    this.lastDroneSpawnTime = 0;
    this.droneSpawnInterval = 5000; // Increased spawn frequency
    this.lastLaserTime = 0;
    this.laserInterval = 20000; // Reduced laser interval
  }

  update(currentTime) {
    super.update(currentTime);

    // Spawn Basic Drones
    if (currentTime - this.lastDroneSpawnTime >= this.droneSpawnInterval) {
      this.game.addEnemy(
        new BasicDrone(
          this.x + Math.random() * 100 - 50,
          this.y + this.height / 2
        )
      );
      this.lastDroneSpawnTime = currentTime;
    }

    // Fire Laser Beam (Special Attack)
    if (currentTime - this.lastLaserTime >= this.laserInterval) {
      this.game.fireLaserBeam(this);
      this.lastLaserTime = currentTime;
    }
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      // Shoot from both sides
      const leftProj = new EnemyProjectile(
        this.x - this.width / 4,
        this.y + this.height / 2,
        this.damage,
        5,
        this.game
      );
      const rightProj = new EnemyProjectile(
        this.x + this.width / 4,
        this.y + this.height / 2,
        this.damage,
        5,
        this.game
      );
      this.game.enemyProjectiles.push(leftProj, rightProj);
      this.game.container.appendChild(leftProj.element);
      this.game.container.appendChild(rightProj.element);
    }
  }
}

class QuantumShifter extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 250, // Reduced health
      speed: 1.0,  // Reduced speed
      damage: 12,  // Reduced damage
      color: "teal",
      width: 80,
      height: 80,
      imageKey: "quantumShifter",
      name: "Quantum Shifter",
    });
    this.lastTeleportTime = 0;
    this.teleportInterval = 8000; // Increased teleport frequency
    this.lastBlackHoleTime = 20000; // Reduced black hole interval
  }

  update(currentTime) {
    super.update(currentTime);

    // Teleport
    if (currentTime - this.lastTeleportTime >= this.teleportInterval) {
      this.x = Math.random() * this.game.container.offsetWidth;
      this.lastTeleportTime = currentTime;
    }

    // Create Black Hole
    if (currentTime - this.lastBlackHoleTime >= this.blackHoleInterval) {
      this.game.createBlackHole(this);
      this.lastBlackHoleTime = currentTime;
    }
  }
}

class HiveMind extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 280, // Reduced health
      speed: 0.3,  // Reduced speed
      damage: 10,  // Reduced damage
      color: "olive",
      width: 90,
      height: 90,
      imageKey: "hiveMind",
      name: "Hive Mind",
    });
    this.lastSwarmTime = 0;
    this.swarmInterval = 5000; // Increased swarm frequency
    this.lastMindControlTime = 20000; // Reduced mind control interval
  }

  update(currentTime) {
    super.update(currentTime);

    // Summon Swarm
    if (currentTime - this.lastSwarmTime >= this.swarmInterval) {
      for (let i = 0; i < 3; i++) {
        this.game.addEnemy(
          new SpeedyZapper(
            Math.random() * this.game.container.offsetWidth,
            this.y
          )
        );
      }
      this.lastSwarmTime = currentTime;
    }

    // Mind Control
    if (currentTime - this.lastMindControlTime >= this.mindControlInterval) {
      this.game.activateMindControl();
      this.lastMindControlTime = currentTime;
    }
  }
}

class TechnoTitan extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 350, // Reduced health
      speed: 0.2,  // Reduced speed
      damage: 18,  // Reduced damage
      color: "silver",
      width: 110,
      height: 110,
      imageKey: "technoTitan",
      name: "Techno Titan",
    });
    this.weakPoints = [
      { x: x - 30, y: y, width: 20, height: 20, destroyed: false },
      { x: x + 30, y: y, width: 20, height: 20, destroyed: false },
    ];
    this.lastEMPTime = 0;
    this.EMPInterval = 20000; // Reduced EMP interval

    // Create weak point elements
    this.weakPointElements = this.weakPoints.map((wp, index) => {
      const wpElement = document.createElement("div");
      wpElement.className = "weak-point";
      wpElement.style.position = "absolute";
      wpElement.style.width = `${wp.width}px`;
      wpElement.style.height = `${wp.height}px`;
      wpElement.style.backgroundColor = "red";
      this.element.appendChild(wpElement);
      return wpElement;
    });
  }

  takeDamage(amount) {
    // Can only be damaged if weak points are destroyed
    if (this.weakPoints.every((wp) => wp.destroyed)) {
      return super.takeDamage(amount);
    }
    return false;
  }

  update(currentTime) {
    super.update(currentTime);

    // EMP Blast
    if (currentTime - this.lastEMPTime >= this.EMPInterval) {
      this.game.activateEMP();
      this.lastEMPTime = currentTime;
    }

    // Update weak point positions
    this.weakPoints.forEach((wp, index) => {
      wp.x = this.x + (index === 0 ? -30 : 30);
      wp.y = this.y;
      if (!wp.destroyed) {
        this.weakPointElements[index].style.display = "block";
        this.weakPointElements[index].style.left = `${wp.x - wp.width / 2}px`;
        this.weakPointElements[index].style.top = `${wp.y - wp.height / 2}px`;
      } else {
        this.weakPointElements[index].style.display = "none";
      }
    });
  }
}

class CosmicHydra extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 320, // Reduced health
      speed: 0.3,  // Reduced speed
      damage: 15,  // Reduced damage
      color: "navy",
      width: 100,
      height: 100,
      imageKey: "cosmicHydra",
      name: "Cosmic Hydra",
    });
    this.lastRegenTime = 0;
    this.regenInterval = 3000; // Increased regen frequency
    this.lastMissileTime = 15000; // Reduced missile interval
  }

  update(currentTime) {
    super.update(currentTime);

    // Regenerate Health
    if (currentTime - this.lastRegenTime >= this.regenInterval) {
      this.health = Math.min(this.health + 30, this.maxHealth);
      this.updateHealthBar();
      this.lastRegenTime = currentTime;
    }

    // Fire Homing Missiles
    if (currentTime - this.lastMissileTime >= this.missileInterval) {
      this.game.fireHomingMissiles(this);
      this.lastMissileTime = currentTime;
    }
  }
}
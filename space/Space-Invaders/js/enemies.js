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
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    this.health -= amount;
    return this.health <= 0;
  }

  render(ctx) {
    if (this.game.assets[this.imageKey]) {
      // If an image is available, draw the image
      ctx.drawImage(
        this.game.assets[this.imageKey],
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback to rectangle if image is not available
      ctx.fillStyle = this.color;
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    }

    // Draw health bar
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2 - 10,
      (this.width * this.health) / this.maxHealth,
      5
    );

    // Draw invulnerability indicator
    if (this.isInvulnerable) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.x - this.width / 2 - 2,
        this.y - this.height / 2 - 2,
        this.width + 4,
        this.height + 4
      );
    }
  }

  move() {
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
  }

  update(currentTime) {
    this.move();
    // Default enemy shooting
    if (this.fireRate > 0) {
      if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
        this.lastShotTime = currentTime;
        const proj = new EnemyProjectile(
          this.x,
          this.y + this.height / 2,
          this.damage,
          5,
          this.game
        );
        this.game.enemyProjectiles.push(proj);
      }
    }
  }
}

class BasicDrone extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 20,
      speed: 1,
      damage: 10,
      color: "green",
      fireRate: 0.2,
      imageKey: "basicDrone",
    });
  }
}

class SpeedyZapper extends BaseEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 15,
      speed: 2,
      damage: 5,
      color: "cyan",
      fireRate: 0.3,
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
      health: 40,
      speed: 0.5,
      damage: 15,
      color: "gray",
      fireRate: 0.1,
      imageKey: "armoredSaucer",
    });
  }

  takeDamage(amount) {
    // Reduces damage by half (simulate armor)
    this.health -= amount / 2;
    return this.health <= 0;
  }
}

class SplittingCube extends BaseEnemy {
  constructor(x, y, size = 40) {
    super(x, y, {
      health: size === 40 ? 30 : 15,
      speed: 0.75,
      damage: 10,
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
      health: 25,
      speed: 1,
      damage: 10,
      color: "violet",
      fireRate: 0.2,
      imageKey: "shieldedOrb",
    });
    this.shieldDuration = 2000; // 2 seconds
    this.shieldCooldown = 5000; // Every 5 seconds
    this.isShielded = false;
    this.lastShieldTime = 0;
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
      setTimeout(() => {
        this.isShielded = false;
        this.isInvulnerable = false;
      }, this.shieldDuration);
    }
  }

  render(ctx) {
    super.render(ctx);
    if (this.isShielded) {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
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
  }

  render(ctx) {
    super.render(ctx);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x, this.y - this.height / 2 - 10);
  }
}

class Mothership extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 500,
      speed: 0.25,
      damage: 25,
      color: "maroon",
      width: 100,
      height: 100,
      imageKey: "mothership",
      name: "Mothership",
    });
    this.lastDroneSpawnTime = 0;
    this.droneSpawnInterval = 10000; // 10 seconds
    this.lastLaserTime = 0;
    this.laserInterval = 30000; // 30 seconds
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
}

class QuantumShifter extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 400,
      speed: 1.5,
      damage: 20,
      color: "teal",
      width: 80,
      height: 80,
      imageKey: "quantumShifter",
      name: "Quantum Shifter",
    });
    this.lastTeleportTime = 0;
    this.teleportInterval = 15000; // 15 seconds
    this.lastBlackHoleTime = 0;
    this.blackHoleInterval = 30000; // 30 seconds
  }

  update(currentTime) {
    super.update(currentTime);

    // Teleport
    if (currentTime - this.lastTeleportTime >= this.teleportInterval) {
      this.x = Math.random() * this.game.canvas.width;
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
      health: 450,
      speed: 0.5,
      damage: 15,
      color: "olive",
      width: 90,
      height: 90,
      imageKey: "hiveMind",
      name: "Hive Mind",
    });
    this.lastSwarmTime = 0;
    this.swarmInterval = 10000; // 10 seconds
    this.lastMindControlTime = 0;
    this.mindControlInterval = 30000; // 30 seconds
  }

  update(currentTime) {
    super.update(currentTime);

    // Summon Swarm
    if (currentTime - this.lastSwarmTime >= this.swarmInterval) {
      for (let i = 0; i < 5; i++) {
        this.game.addEnemy(
          new SpeedyZapper(Math.random() * this.game.canvas.width, this.y)
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
      health: 600,
      speed: 0.3,
      damage: 30,
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
    this.EMPInterval = 30000; // 30 seconds
  }

  takeDamage(amount) {
    // Can only be damaged if weak points are destroyed
    if (this.weakPoints.every((wp) => wp.destroyed)) {
      super.takeDamage(amount);
      return this.health <= 0;
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
  }

  render(ctx) {
    super.render(ctx);

    // Draw weak points
    ctx.fillStyle = "red";
    this.weakPoints.forEach((wp) => {
      if (!wp.destroyed) {
        ctx.fillRect(
          wp.x - wp.width / 2,
          wp.y - wp.height / 2,
          wp.width,
          wp.height
        );
      }
    });
  }
}

class CosmicHydra extends BossEnemy {
  constructor(x, y) {
    super(x, y, {
      health: 550,
      speed: 0.4,
      damage: 25,
      color: "navy",
      width: 100,
      height: 100,
      imageKey: "cosmicHydra",
      name: "Cosmic Hydra",
    });
    this.lastRegenTime = 0;
    this.regenInterval = 5000; // 5 seconds
    this.lastMissileTime = 0;
    this.missileInterval = 20000; // 20 seconds
  }

  update(currentTime) {
    super.update(currentTime);

    // Regenerate Health
    if (currentTime - this.lastRegenTime >= this.regenInterval) {
      this.health = Math.min(this.health + 20, this.maxHealth);
      this.lastRegenTime = currentTime;
    }

    // Fire Homing Missiles
    if (currentTime - this.lastMissileTime >= this.missileInterval) {
      this.game.fireHomingMissiles(this);
      this.lastMissileTime = currentTime;
    }
  }
}

class MenuManager {
  constructor(game) {
    this.game = game;
    this.currentMenu = null;
  }

  showMenu(menuName) {
    this.currentMenu = menuName;
    console.log(`Showing menu: ${menuName}`);
  }

  hideMenu() {
    this.currentMenu = null;
  }

  handleClick(x, y) {
    switch (this.currentMenu) {
      case "main":
        this.game.showCharacterSelect();
        break;
      case "characterSelect":
        const clickedIndex = Math.floor((y - 150) / 100);
        if (clickedIndex >= 0 && clickedIndex < this.game.playerTypes.length) {
          this.game.selectedPlayerIndex = clickedIndex;
          this.game.startGame();
        }
        break;
      case "pause":
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        if (Math.abs(x - centerX) < 100) {
          if (Math.abs(y - (centerY - 20)) < 20) {
            this.game.resumeGame();
          } else if (Math.abs(y - (centerY + 60)) < 20) {
            this.game.returnToMainMenu();
          }
        }
        break;
      case "gameOver":
        this.game.returnToMainMenu();
        break;
    }
  }

  render(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    switch (this.currentMenu) {
      case "main":
        ctx.fillText(
          "Space Invaders",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 50
        );
        ctx.fillText(
          "Click to Start",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 + 50
        );
        break;
      case "characterSelect":
        ctx.fillText("Select Your Character", this.game.canvas.width / 2, 100);
        this.game.playerTypes.forEach((type, index) => {
          const y = 200 + index * 100;
          ctx.fillStyle =
            index === this.game.selectedPlayerIndex ? "yellow" : "white";
          ctx.fillText(type.name, this.game.canvas.width / 2, y);
          ctx.fillStyle = type.color;
          ctx.fillRect(this.game.canvas.width / 2 - 25, y + 10, 50, 50);
        });
        break;
      case "pause":
        ctx.fillText(
          "Paused",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 100
        );
        ctx.fillText(
          "Resume",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 20
        );
        ctx.fillText(
          "Main Menu",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 + 60
        );
        break;
      case "gameOver":
        ctx.fillText(
          "Game Over",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 50
        );
        ctx.fillText(
          `Score: ${this.game.score}`,
          this.game.canvas.width / 2,
          this.game.canvas.height / 2
        );
        ctx.fillText(
          "Click to Return to Main Menu",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 + 50
        );
        break;
    }
  }
}

class BasePlayer {
  constructor(x, y, stats) {
    this.game = null; // Will be set when player is created
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;

    this.baseSpeed = stats.speed;
    this.speed = stats.speed;
    this.baseFireRate = stats.fireRate;
    this.fireRate = stats.fireRate;
    this.baseDamage = stats.damage;
    this.damage = stats.damage;
    this.maxHealth = stats.health;
    this.health = stats.health;
    this.defense = stats.defense;
    this.specialAbility = stats.specialAbility;
    this.specialAbilityCooldown = stats.specialAbilityCooldown * 1000; // Convert to milliseconds
    this.lastSpecialUseTime = 0;
    this.isSpecialActive = false;
    this.lastShotTime = 0; // Initialize lastShotTime
    this.isInvulnerable = false; // For temporary invulnerability

    // Power-up effects
    this.activePowerUps = [];
    this.shieldCharges = 0;
    this.spreadShotActive = false;
    this.piercingShotActive = false;
    this.sidekick = null;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    // Draw health bar
    ctx.fillStyle = "green";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y + this.height / 2 + 5,
      (this.width * this.health) / this.maxHealth,
      5
    );

    // Draw special ability indicator if active
    if (this.isSpecialActive) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.x - this.width / 2 - 5,
        this.y - this.height / 2 - 5,
        this.width + 10,
        this.height + 10
      );
    }

    // Draw shield bubble
    if (this.shieldCharges > 0) {
      ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw invulnerability indicator
    if (this.isInvulnerable) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.x - this.width / 2 - 5,
        this.y - this.height / 2 - 5,
        this.width + 10,
        this.height + 10
      );
    }
  }

  move(dx) {
    if (this.game.isMindControlled) dx = -dx; // Reverse controls
    this.x += dx * this.speed;

    // Keep player within canvas boundaries
    if (this.x - this.width / 2 < 0) {
      this.x = this.width / 2;
    } else if (this.x + this.width / 2 > this.game.canvas.width) {
      this.x = this.game.canvas.width - this.width / 2;
    }
  }

  update(currentTime) {
    // Update active power-ups
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.activePowerUps[i];
      if (currentTime - powerUp.startTime >= powerUp.duration) {
        powerUp.deactivate();
        this.activePowerUps.splice(i, 1);
      }
    }

    // Update sidekick
    if (this.sidekick) {
      this.sidekick.update(currentTime);
    }
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;

      const projectiles = [];

      if (this.spreadShotActive) {
        // Fire three projectiles in a spread pattern
        const angles = [-0.1, 0, 0.1];
        angles.forEach((angle) => {
          const proj = new Projectile(
            this.x,
            this.y - this.height / 2,
            this.damage,
            angle,
            this.piercingShotActive,
            this.game.comboLevel >= 5 // Splash damage at combo level 5
          );
          projectiles.push(proj);
        });
      } else {
        // Single projectile
        const proj = new Projectile(
          this.x,
          this.y - this.height / 2,
          this.damage,
          0,
          this.piercingShotActive,
          this.game.comboLevel >= 5 // Splash damage at combo level 5
        );
        projectiles.push(proj);
      }

      // Sidekick fires
      if (this.sidekick) {
        const proj = new Projectile(
          this.sidekick.x,
          this.sidekick.y - this.sidekick.height / 2,
          this.damage / 2,
          0,
          this.piercingShotActive
        );
        projectiles.push(proj);
      }

      return projectiles;
    }
    return null;
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      return false;
    }
    const actualDamage = amount * (1 - this.defense / 100);
    this.health -= actualDamage;
    return this.health <= 0;
  }

  useSpecialAbility(currentTime) {
    if (this.isEMPDissed) {
      console.log("Special ability disabled by EMP!");
      return false;
    }
    if (currentTime - this.lastSpecialUseTime >= this.specialAbilityCooldown) {
      this.lastSpecialUseTime = currentTime;
      this.isSpecialActive = true;
      const duration = this.specialAbility();
      setTimeout(() => {
        this.isSpecialActive = false;
      }, duration);
      return true;
    }
    return false;
  }

  specialAbility() {
    console.log("Special ability used");
    return 0; // Duration of the special ability effect
  }

  getSpecialCooldownPercentage(currentTime) {
    const elapsedTime = currentTime - this.lastSpecialUseTime;
    return Math.min(elapsedTime / this.specialAbilityCooldown, 1);
  }

  activatePowerUp(powerUp) {
    powerUp.activate();
    powerUp.startTime = performance.now();
    this.activePowerUps.push(powerUp);
  }
}

class Speedster extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 15,
      fireRate: 2,
      damage: 3,
      health: 60,
      defense: 5,
      specialAbility: () => this.dodgeRoll(),
      specialAbilityCooldown: 5,
    });
    this.color = "yellow";
  }

  dodgeRoll() {
    console.log("Dodge Roll used!");
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.x += this.speed * 30 * direction; // Quick dodge left or right
    // Keep player within canvas boundaries
    if (this.x - this.width / 2 < 0) {
      this.x = this.width / 2;
    } else if (this.x + this.width / 2 > this.game.canvas.width) {
      this.x = this.game.canvas.width - this.width / 2;
    }

    this.isInvulnerable = true;
    setTimeout(() => {
      this.isInvulnerable = false;
    }, 500); // Invulnerability duration
    return 500; // Return duration of the special ability effect (for isSpecialActive)
  }
}

class Tank extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 5,
      fireRate: 1,
      damage: 7,
      health: 150,
      defense: 25,
      specialAbility: () => this.fortify(),
      specialAbilityCooldown: 20,
    });
    this.color = "blue";
    this.fortifyActive = false;
  }

  fortify() {
    this.fortifyActive = true;
    console.log("Fortify activated!");
    setTimeout(() => {
      this.fortifyActive = false;
    }, 10000);
    return 10000; // Duration of fortify effect
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      return false;
    }
    const fortifyReduction = this.fortifyActive ? 0.25 : 0;
    const actualDamage = amount * (1 - this.defense / 100 - fortifyReduction);
    this.health -= actualDamage;
    return this.health <= 0;
  }
}

class GlassCannon extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 10,
      fireRate: 3,
      damage: 7,
      health: 50,
      defense: 0,
      specialAbility: () => this.powerSurge(),
      specialAbilityCooldown: 15,
    });
    this.color = "red";
    this.powerSurgeActive = false;
  }

  powerSurge() {
    this.powerSurgeActive = true;
    console.log("Power Surge activated!");
    setTimeout(() => {
      this.powerSurgeActive = false;
    }, 5000);
    return 5000; // Duration of power surge effect
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      const projectile = new Projectile(
        this.x,
        this.y - this.height / 2,
        this.powerSurgeActive ? this.damage * 2 : this.damage,
        0,
        this.piercingShotActive,
        this.game.comboLevel >= 5 // Splash damage at combo level 5
      );
      return [projectile];
    }
    return null;
  }
}

class AllRounder extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 10,
      fireRate: 2,
      damage: 5,
      health: 100,
      defense: 10,
      specialAbility: () => this.energyWave(),
      specialAbilityCooldown: 25,
    });
    this.color = "purple";
  }

  energyWave() {
    console.log("Energy Wave released!");
    this.game.releaseEnergyWave();
    return 1000; // Duration of energy wave effect
  }
}

class Sidekick extends BasePlayer {
  constructor(x, y, player) {
    super(x, y, {
      speed: player.speed,
      fireRate: player.fireRate,
      damage: player.damage / 2,
      health: player.maxHealth / 2,
      defense: player.defense,
      specialAbility: null,
      specialAbilityCooldown: 0,
    });
    this.color = "lightgray";
    this.player = player;
    this.width = 30;
    this.height = 30;
  }

  update(currentTime) {
    // Follow the player
    this.x = this.player.x + 50;
    this.y = this.player.y;
  }

  shoot(currentTime) {
    // Shooting is handled in the player's shoot method
    return null;
  }
}

class BaseEnemy {
  constructor(x, y, stats) {
    this.game = null; // Will be set when enemy is created
    this.x = x;
    this.y = y;
    this.width = stats.width || 40;
    this.height = stats.height || 40;
    this.speed = stats.speed || 1;
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.damage = stats.damage || 10;
    this.color = stats.color || "green";
    this.isInvulnerable = false;
    this.lastAbilityTime = 0;
    this.lastShotTime = 0;
    this.fireRate = stats.fireRate || 0.5; // Default enemy fire rate
  }

  takeDamage(amount) {
    if (this.isInvulnerable) {
      return false;
    }
    this.health -= amount;
    return this.health <= 0;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

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
    });
  }

  takeDamage(amount) {
    // Requires two hits to destroy (simulate armor)
    this.health -= amount / 2; // Reduces damage by half
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
  }

  render(ctx) {
    super.render(ctx);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x, this.y - this.height);
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
    });
    this.name = "Mothership";
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
    });
    this.name = "Quantum Shifter";
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
    });
    this.name = "Hive Mind";
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
    });
    this.name = "Techno Titan";
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
    });
    this.name = "Cosmic Hydra";
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

class Projectile {
  constructor(x, y, damage, angle = 0, piercing = false, splash = false) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 15;
    this.speed = 7;
    this.damage = damage;
    this.angle = angle; // For spread shots
    this.piercing = piercing;
    this.splash = splash;
  }

  render(ctx) {
    ctx.fillStyle = this.piercing ? "lime" : "white";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  move() {
    this.x += Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }
}

class EnemyProjectile {
  constructor(x, y, damage, speed = 5, game) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 15;
    this.speed = speed;
    this.damage = damage;
    this.game = game;
  }

  render(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }

  move() {
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
  }
}

// Power-Up Classes
class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.type = "";
    this.duration = 0;
    this.startTime = 0;
  }

  render(ctx) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }

  update() {
    // Move downwards
    this.y += 2;
  }

  activate() {
    // To be overridden in subclasses
  }

  deactivate() {
    // To be overridden in subclasses
  }
}

class RapidFirePowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "RapidFire";
    this.duration = 10000;
    this.player = player;
  }

  activate() {
    this.player.fireRate *= 2;
  }

  deactivate() {
    this.player.fireRate = this.player.baseFireRate;
  }

  render(ctx) {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class ShieldBubblePowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "ShieldBubble";
    this.duration = 15000;
    this.player = player;
    this.player.shieldCharges = 3; // Absorb up to 3 hits
  }

  activate() {
    // Shield charges already set in constructor
  }

  deactivate() {
    this.player.shieldCharges = 0;
  }

  render(ctx) {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class SpreadShotPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "SpreadShot";
    this.duration = 12000;
    this.player = player;
  }

  activate() {
    this.player.spreadShotActive = true;
  }

  deactivate() {
    this.player.spreadShotActive = false;
  }

  render(ctx) {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size / 2);
    ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
    ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
    ctx.closePath();
    ctx.fill();
  }
}

// Implement other power-ups similarly...

class MagnetPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "Magnet";
    this.duration = 20000;
    this.player = player;
  }

  activate() {
    this.player.magnetActive = true;
  }

  deactivate() {
    this.player.magnetActive = false;
  }

  render(ctx) {
    ctx.fillStyle = "purple";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }
}

class TimeWarpPowerUp extends PowerUp {
  constructor(x, y, game) {
    super(x, y);
    this.type = "TimeWarp";
    this.duration = 8000;
    this.game = game;
  }

  activate() {
    this.game.timeWarpActive = true;
  }

  deactivate() {
    this.game.timeWarpActive = false;
  }

  render(ctx) {
    ctx.fillStyle = "lightblue";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }
}

class PiercingShotPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "PiercingShot";
    this.duration = 15000;
    this.player = player;
  }

  activate() {
    this.player.piercingShotActive = true;
  }

  deactivate() {
    this.player.piercingShotActive = false;
  }

  render(ctx) {
    ctx.fillStyle = "lime";
    ctx.fillRect(
      this.x - this.size / 4,
      this.y - this.size / 2,
      this.size / 2,
      this.size
    );
  }
}

class HealthPack extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "HealthPack";
    this.player = player;
  }

  activate() {
    this.player.health = Math.min(
      this.player.health + this.player.maxHealth * 0.25,
      this.player.maxHealth
    );
  }

  deactivate() {
    // No action needed
  }

  render(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.x - this.size / 8,
      this.y - this.size / 4,
      this.size / 4,
      this.size / 2
    );
    ctx.fillRect(
      this.x - this.size / 4,
      this.y - this.size / 8,
      this.size / 2,
      this.size / 4
    );
  }
}

class BombPowerUp extends PowerUp {
  constructor(x, y, game) {
    super(x, y);
    this.type = "Bomb";
    this.game = game;
  }

  activate() {
    this.game.clearRegularEnemies();
  }

  deactivate() {
    // Instant effect
  }

  render(ctx) {
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class SidekickPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "Sidekick";
    this.duration = 30000;
    this.player = player;
  }

  activate() {
    this.player.sidekick = new Sidekick(
      this.player.x + 50,
      this.player.y,
      this.player
    );
    this.game.entities.push(this.player.sidekick);
  }

  deactivate() {
    const index = this.game.entities.indexOf(this.player.sidekick);
    if (index > -1) {
      this.game.entities.splice(index, 1);
    }
    this.player.sidekick = null;
  }

  render(ctx) {
    ctx.fillStyle = "silver";
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }
}

class UltimateChargePowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "UltimateCharge";
    this.player = player;
  }

  activate() {
    this.player.lastSpecialUseTime = 0;
  }

  deactivate() {
    // Instant effect
  }

  render(ctx) {
    ctx.fillStyle = this.player.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Combo System
class ComboSystem {
  constructor(game) {
    this.game = game;
    this.comboCount = 0;
    this.comboLevel = 1;
    this.lastKillTime = 0;
    this.comboTimer = 5000; // 5 seconds
  }

  incrementCombo() {
    const currentTime = performance.now();
    if (currentTime - this.lastKillTime <= this.comboTimer) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastKillTime = currentTime;
    this.updateComboLevel();
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboLevel = 1;
  }

  updateComboLevel() {
    if (this.comboCount >= 41) {
      this.comboLevel = 5;
    } else if (this.comboCount >= 31) {
      this.comboLevel = 4;
    } else if (this.comboCount >= 21) {
      this.comboLevel = 3;
    } else if (this.comboCount >= 11) {
      this.comboLevel = 2;
    } else {
      this.comboLevel = 1;
    }
    // Adjust player's fire rate based on combo level
    this.game.player.fireRate =
      this.game.player.baseFireRate * (1 + 0.2 * (this.comboLevel - 1));
  }

  update(currentTime) {
    if (currentTime - this.lastKillTime > this.comboTimer) {
      this.resetCombo();
    }
  }

  render(ctx) {
    // Draw combo meter
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Combo: x${this.comboLevel} (${this.comboCount})`,
      this.game.canvas.width / 2,
      30
    );

    // Draw combo timer bar
    const timeLeft = Math.max(
      0,
      this.comboTimer - (performance.now() - this.lastKillTime)
    );
    const barWidth = 200;
    const barHeight = 10;
    ctx.fillStyle = "yellow";
    ctx.fillRect(
      this.game.canvas.width / 2 - barWidth / 2,
      40,
      (barWidth * timeLeft) / this.comboTimer,
      barHeight
    );
    ctx.strokeStyle = "white";
    ctx.strokeRect(
      this.game.canvas.width / 2 - barWidth / 2,
      40,
      barWidth,
      barHeight
    );
  }
}

const game = {
  playerTypes: [
    { name: "Speedster", class: Speedster, color: "yellow" },
    { name: "Tank", class: Tank, color: "blue" },
    { name: "Glass Cannon", class: GlassCannon, color: "red" },
    { name: "All-Rounder", class: AllRounder, color: "purple" },
  ],
  selectedPlayerIndex: 0,

  init() {
    this.canvas = document.getElementById("game-container");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.menuManager = new MenuManager(this);
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

    this.gameLoop();

    console.log(
      "Game initialized. Canvas size:",
      this.canvas.width,
      "x",
      this.canvas.height
    );
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
    }
  },

  render(currentTime) {
    // Clear canvas
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isRunning && !this.isPaused) {
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
    }

    if (this.menuManager.currentMenu) {
      this.menuManager.render(this.ctx);
    }
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
      powerUp = new SidekickPowerUp(x, y, this.player);
    } else if (rand < 0.8) {
      powerUp = new MagnetPowerUp(x, y, this.player);
    } else if (rand < 0.9) {
      powerUp = new UltimateChargePowerUp(x, y, this.player);
    } else {
      powerUp = new TimeWarpPowerUp(x, y, this);
    }
    this.powerUps.push(powerUp);
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

window.addEventListener("load", () => game.init());

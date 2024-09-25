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

// Player subclasses
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
    return 500; // Duration of the special ability effect
  }

  render(ctx) {
    // Use the speedster image if available
    if (this.game.assets.speedster) {
      ctx.drawImage(
        this.game.assets.speedster, // The loaded image
        this.x - this.width / 2, // X position
        this.y - this.height / 2, // Y position
        this.width, // Width to draw
        this.height // Height to draw
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

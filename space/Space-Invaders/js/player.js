class BasePlayer {
  constructor(x, y, stats) {
    this.game = null; // Will be set when player is created
    this.x = x;
    this.y = y;
    this.width = 100;
    this.height = 100;

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

    // Create DOM element
    this.element = document.createElement("div");
    this.element.className = "player game-object";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = "absolute";
    this.element.style.backgroundSize = "contain";
    this.element.style.backgroundRepeat = "no-repeat";
    this.element.style.backgroundPosition = "center";
    this.element.style.transform = "translate(-50%, -50%)"; // Center the player element


    // Create health bar
    this.healthBar = document.createElement("div");
    this.healthBar.className = "health-bar";
    this.healthBar.style.position = "absolute";
    this.healthBar.style.bottom = "-10px";
    this.healthBar.style.left = "0";
    this.healthBar.style.width = "100%";
    this.healthBar.style.height = "5px";
    this.healthBar.style.backgroundColor = "green";
    this.element.appendChild(this.healthBar);

    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  render() {
    if (this.game.assets[this.constructor.name.toLowerCase()]) {
      this.element.style.backgroundImage = `url(${this.game.assets[this.constructor.name.toLowerCase()].src})`;
    } else {
      this.element.style.backgroundColor = this.color;
    }

    this.updatePosition();
    this.healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
    this.updateIndicators();
  }

  updateIndicators() {
    this.element.classList.toggle("special-active", this.isSpecialActive);
    this.element.classList.toggle("shield-active", this.shieldCharges > 0);
    this.element.classList.toggle("invulnerable", this.isInvulnerable);
  }

  move(dx) {
    if (this.game.isMindControlled) dx = -dx; // Reverse controls
    this.x += dx * this.speed;

    // Keep player within game container boundaries
    const maxX = this.game.container.offsetWidth - this.width / 2;
    const minX = this.width / 2;
    this.x = Math.max(minX, Math.min(this.x, maxX));

    this.updatePosition();
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

    this.render();
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
            this.y - this.height / 2, // Adjust the y position to spawn from the top of the player
            this.damage,
            angle,
            this.piercingShotActive,
            this.game.comboSystem.comboLevel >= 5 // Splash damage at combo level 5
          );
          projectiles.push(proj);
        });
      } else {
        // Single projectile
        const proj = new Projectile(
          this.x,
          this.y - this.height / 2, // Adjust the y position to spawn from the top of the player
          this.damage,
          0,
          this.piercingShotActive,
          this.game.comboSystem.comboLevel >= 5 // Splash damage at combo level 5
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
    this.render(); // Update health bar
    return this.health <= 0;
  }

  useSpecialAbility(currentTime) {
    if (this.game.isEMPDissed) {
      console.log("Special ability disabled by EMP!");
      return false;
    }
    if (currentTime - this.lastSpecialUseTime >= this.specialAbilityCooldown) {
      this.lastSpecialUseTime = currentTime;
      this.isSpecialActive = true;
      const duration = this.specialAbility();
      setTimeout(() => {
        this.isSpecialActive = false;
        this.render();
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
    // Keep player within game container boundaries
    const maxX = this.game.container.offsetWidth - this.width / 2;
    const minX = this.width / 2;
    this.x = Math.max(minX, Math.min(this.x, maxX));

    this.isInvulnerable = true;
    this.updatePosition();
    setTimeout(() => {
      this.isInvulnerable = false;
      this.render();
    }, 500); // Invulnerability duration
    return 500; // Duration of the special ability effect
  }
}

class Tank extends BasePlayer {
  constructor(x, y) {
    super(x, y, {
      speed: 25,
      fireRate: 20,
      damage: 70,
      health: 250,
      defense: 225,
      specialAbility: () => this.fortify(),
      specialAbilityCooldown: 10,
    });
    this.color = "blue";
    this.fortifyActive = false;
  }

  fortify() {
    this.fortifyActive = true;
    console.log("Fortify activated!");
    this.element.classList.add("fortify");
    setTimeout(() => {
      this.fortifyActive = false;
      this.element.classList.remove("fortify");
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
    this.render(); // Update health bar
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
    this.element.classList.add("power-surge");
    setTimeout(() => {
      this.powerSurgeActive = false;
      this.element.classList.remove("power-surge");
    }, 5000);
    return 5000; // Duration of power surge effect
  }

  shoot(currentTime) {
    if (currentTime - this.lastShotTime >= 1000 / this.fireRate) {
      this.lastShotTime = currentTime;
      const projectile = new Projectile(
        this.x,
        this.y,
        this.powerSurgeActive ? this.damage * 2 : this.damage,
        0,
        this.piercingShotActive,
        this.game.comboSystem.comboLevel >= 5 // Splash damage at combo level 5
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
  constructor(x, y, player, game) {
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
    this.game = game; // Set the game property
    this.width = 30;
    this.height = 30;
    this.offsetX = 70;
    this.offsetY = -30;
    this.angle = 0;

    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
  }

  update(currentTime) {
    // Circular motion around the offset point
    this.angle += 0.05; // Adjust this value to change rotation speed
    const circleRadius = 10; // Adjust this value to change the circle size

    this.x = this.player.x + this.offsetX + Math.cos(this.angle) * circleRadius;
    this.y = this.player.y + this.offsetY + Math.sin(this.angle) * circleRadius;

    // Ensure the sidekick stays within the game boundaries
    const maxX = this.game.container.offsetWidth - this.width / 2;
    const minX = this.width / 2;
    const maxY = this.game.container.offsetHeight - this.height / 2;
    const minY = this.height / 2;
    this.x = Math.max(minX, Math.min(this.x, maxX));
    this.y = Math.max(minY, Math.min(this.y, maxY));

    this.render();
  }

  shoot(currentTime) {
    // Shooting is handled in the player's shoot method
    return null;
  }

  render() {
    super.render();
    if (this.game && this.game.assets && this.game.assets.sidekick) {
      this.element.style.backgroundImage = `url(${this.game.assets.sidekick.src})`;
    }
  }
}
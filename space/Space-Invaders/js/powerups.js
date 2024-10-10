class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.type = "";
    this.duration = 0;
    this.startTime = 0;

    this.element = document.createElement("div");
    this.element.className = "power-up";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    this.element.style.left = `${this.x - this.size / 2}px`;
    this.element.style.top = `${this.y - this.size / 2}px`;
  }

  render() {
    this.element.style.left = `${this.x - this.size / 2}px`;
    this.element.style.top = `${this.y - this.size / 2}px`;
  }

  update() {
    this.y += 2;
    this.render();
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
    this.element.classList.add("rapid-fire");
  }

  activate() {
    this.player.fireRate *= 2;
  }

  deactivate() {
    this.player.fireRate = this.player.baseFireRate;
  }
}

class ShieldBubblePowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "ShieldBubble";
    this.duration = 15000;
    this.player = player;
    this.player.shieldCharges = 3; // Absorb up to 3 hits
    this.element.classList.add("shield-bubble");
  }

  activate() {
    // Shield charges already set in constructor
  }

  deactivate() {
    this.player.shieldCharges = 0;
  }
}

class SpreadShotPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "SpreadShot";
    this.duration = 12000;
    this.player = player;
    this.element.classList.add("spread-shot");
  }

  activate() {
    this.player.spreadShotActive = true;
  }

  deactivate() {
    this.player.spreadShotActive = false;
  }
}

class MagnetPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "Magnet";
    this.duration = 20000;
    this.player = player;
    this.element.classList.add("magnet");
  }

  activate() {
    this.player.magnetActive = true;
  }

  deactivate() {
    this.player.magnetActive = false;
  }
}

class TimeWarpPowerUp extends PowerUp {
  constructor(x, y, game) {
    super(x, y);
    this.type = "TimeWarp";
    this.duration = 8000;
    this.game = game;
    this.element.classList.add("time-warp");
  }

  activate() {
    this.game.timeWarpActive = true;
  }

  deactivate() {
    this.game.timeWarpActive = false;
  }
}

class PiercingShotPowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "PiercingShot";
    this.duration = 15000;
    this.player = player;
    this.element.classList.add("piercing-shot");
  }

  activate() {
    this.player.piercingShotActive = true;
  }

  deactivate() {
    this.player.piercingShotActive = false;
  }
}

class HealthPack extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "HealthPack";
    this.player = player;
    this.element.classList.add("health-pack");
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
}

class BombPowerUp extends PowerUp {
  constructor(x, y, game) {
    super(x, y);
    this.type = "Bomb";
    this.game = game;
    this.element.classList.add("bomb");
  }

  activate() {
    this.game.clearRegularEnemies();
  }

  deactivate() {
    // Instant effect
  }
}

class SidekickPowerUp extends PowerUp {
  constructor(x, y, player, game) {
    super(x, y);
    this.type = "Sidekick";
    this.duration = 3000;
    this.player = player;
    this.game = game;
    this.element.classList.add("sidekick");
  }

  activate() {
    this.player.sidekick = new Sidekick(
      this.player.x + 50,
      this.player.y,
      this.player,
      this.game
    );
    this.game.entities.push(this.player.sidekick);
    this.game.container.appendChild(this.player.sidekick.element);
  }

  deactivate() {
    const index = this.game.entities.indexOf(this.player.sidekick);
    if (index > -1) {
      this.game.entities.splice(index, 1);
    }
    if (this.player.sidekick && this.player.sidekick.element) {
      this.player.sidekick.element.remove();
    }
    this.player.sidekick = null;
  }
}

class UltimateChargePowerUp extends PowerUp {
  constructor(x, y, player) {
    super(x, y);
    this.type = "UltimateCharge";
    this.player = player;
    this.element.classList.add("ultimate-charge");
  }

  activate() {
    this.player.lastSpecialUseTime = 0;
  }

  deactivate() {
    // Instant effect
  }
}

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
  constructor(x, y, player, game) {
    super(x, y);
    this.type = "Sidekick";
    this.duration = 30000;
    this.player = player;
    this.game = game;
  }

  activate() {
    this.player.sidekick = new Sidekick(
      this.player.x + 50,
      this.player.y,
      this.player,
      this.game
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

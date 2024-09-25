// projectiles.js

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

// Attach classes to the global window object
window.Projectile = Projectile;
window.EnemyProjectile = EnemyProjectile;

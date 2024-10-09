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

    this.element = document.createElement("div");
    this.element.className = "projectile";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundColor = this.piercing ? "lime" : "white";
    this.render();
  }

  render() {
    this.element.style.left = `${this.x - this.width / 2}px`;
    this.element.style.top = `${this.y - this.height / 2}px`;
    this.element.style.transform = `rotate(${this.angle}rad)`;
  }

  move() {
    this.x += Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
    this.render();
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

    this.element = document.createElement("div");
    this.element.className = "enemy-projectile";
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.backgroundColor = "red";
    this.render();
  }

  render() {
    this.element.style.left = `${this.x - this.width / 2}px`;
    this.element.style.top = `${this.y - this.height / 2}px`;
  }

  move() {
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
    this.render();
  }
}

// Attach classes to the global window object
window.Projectile = Projectile;
window.EnemyProjectile = EnemyProjectile;

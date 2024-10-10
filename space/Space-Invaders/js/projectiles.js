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
    this.element.style.transform = "translate(-50%, -50%)"; // Center the projectile element
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.transform = `translate(-50%, -50%) rotate(${this.angle}rad)`;
  }

  move() {
    this.x += Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
    this.updatePosition();
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
    this.element.style.transform = "translate(-50%, -50%)"; // Center the projectile element
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  move() {
    this.y += this.speed * (this.game.timeWarpActive ? 0.5 : 1);
    this.updatePosition();
  }
}

// Attach classes to the global window object
window.Projectile = Projectile;
window.EnemyProjectile = EnemyProjectile;
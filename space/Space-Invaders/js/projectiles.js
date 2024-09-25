class Projectile {
  constructor(x, y, angle, speed, radius, color, isEnemy = false) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.radius = radius;
    this.color = color;
    this.isEnemy = isEnemy;
  }

  update(deltaTime) {
    this.x += Math.cos(this.angle) * this.speed * deltaTime;
    this.y += Math.sin(this.angle) * this.speed * deltaTime;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  isOffScreen(width, height) {
    return (
      this.x < -this.radius ||
      this.x > width + this.radius ||
      this.y < -this.radius ||
      this.y > height + this.radius
    );
  }

  isCollidingWith(entity) {
    const dx = this.x - (entity.x + entity.width / 2);
    const dy = this.y - (entity.y + entity.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + Math.max(entity.width, entity.height) / 2;
  }
}

class EnemyProjectile extends Projectile {
  constructor(x, y, angle, speed, radius, color) {
    super(x, y, angle, speed, radius, color, true);
  }
}

class ProjectileController {
  constructor(game) {
    this.game = game;
    this.projectiles = [];
  }

  update(deltaTime) {
    this.projectiles.forEach((projectile, index) => {
      projectile.update(deltaTime);

      // Remove projectiles that are off-screen
      if (projectile.isOffScreen(this.game.width, this.game.height)) {
        this.projectiles.splice(index, 1);
        return;
      }

      // Check collisions
      this.game.entities.forEach((entity) => {
        if (
          (projectile.isEnemy && entity instanceof Player) ||
          (!projectile.isEnemy && entity instanceof Enemy)
        ) {
          if (projectile.isCollidingWith(entity)) {
            entity.onCollision(projectile);
            this.projectiles.splice(index, 1);
          }
        }
      });
    });
  }

  render(ctx) {
    this.projectiles.forEach((projectile) => projectile.render(ctx));
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }

  reset() {
    this.projectiles = [];
  }
}

// Helper function to create a player projectile
function createPlayerProjectile(x, y) {
  return new Projectile(
    x,
    y,
    -Math.PI / 2, // Angle (upwards)
    500, // Speed
    3, // Radius
    "#00ffff", // Color
    false // Not an enemy projectile
  );
}

// Helper function to create an enemy projectile
function createEnemyProjectile(x, y) {
  return new EnemyProjectile(
    x,
    y,
    Math.PI / 2, // Angle (downwards)
    300, // Speed
    3, // Radius
    "#ff0000" // Color
  );
}

class CollisionManager {
  constructor(game) {
    this.game = game;
  }

  checkCollisions() {
    this.checkPlayerEnemyCollisions();
    this.checkPlayerProjectileCollisions();
    this.checkEnemyProjectileCollisions();
    this.checkPlayerPowerUpCollisions();
  }

  checkPlayerEnemyCollisions() {
    const player = this.game.player;
    this.game.enemyController.enemies.forEach((enemy) => {
      if (this.isColliding(player, enemy)) {
        this.handlePlayerEnemyCollision(player, enemy);
      }
    });
  }

  checkPlayerProjectileCollisions() {
    this.game.projectileController.projectiles.forEach((projectile, index) => {
      if (!projectile.isEnemy) {
        this.game.enemyController.enemies.forEach((enemy) => {
          if (this.isColliding(projectile, enemy)) {
            this.handleProjectileEnemyCollision(projectile, enemy);
            this.game.projectileController.projectiles.splice(index, 1);
          }
        });
      }
    });
  }

  checkEnemyProjectileCollisions() {
    const player = this.game.player;
    this.game.projectileController.projectiles.forEach((projectile, index) => {
      if (projectile.isEnemy && this.isColliding(projectile, player)) {
        this.handleEnemyProjectilePlayerCollision(projectile, player);
        this.game.projectileController.projectiles.splice(index, 1);
      }
    });
  }

  checkPlayerPowerUpCollisions() {
    const player = this.game.player;
    this.game.powerUps.forEach((powerUp, index) => {
      if (this.isColliding(player, powerUp)) {
        this.handlePlayerPowerUpCollision(player, powerUp);
        this.game.powerUps.splice(index, 1);
      }
    });
  }

  isColliding(entity1, entity2) {
    // Rectangular collision detection
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }

  handlePlayerEnemyCollision(player, enemy) {
    if (!player.invulnerable) {
      player.takeDamage();
      this.game.enemyController.removeEnemy(enemy);
    }
  }

  handleProjectileEnemyCollision(projectile, enemy) {
    this.game.score += enemy.points;
    this.game.enemyController.removeEnemy(enemy);
    // Optionally spawn power-up
    if (Math.random() < 0.1) {
      // 10% chance to spawn power-up
      this.spawnPowerUp(enemy.x, enemy.y);
    }
  }

  handleEnemyProjectilePlayerCollision(projectile, player) {
    if (!player.invulnerable) {
      player.takeDamage();
    }
  }

  handlePlayerPowerUpCollision(player, powerUp) {
    powerUp.applyEffect(player);
  }

  spawnPowerUp(x, y) {
    const powerUpTypes = ["extraLife", "shield", "rapidFire"];
    const randomType =
      powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    const powerUp = new PowerUp(x, y, randomType);
    this.game.powerUps.push(powerUp);
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type;
    this.color = this.getColorByType();
  }

  getColorByType() {
    switch (this.type) {
      case "extraLife":
        return "#00ff00";
      case "shield":
        return "#0000ff";
      case "rapidFire":
        return "#ffff00";
      default:
        return "#ffffff";
    }
  }

  applyEffect(player) {
    switch (this.type) {
      case "extraLife":
        player.lives++;
        break;
      case "shield":
        player.activateShield(5); // 5 seconds of shield
        break;
      case "rapidFire":
        player.activateRapidFire(10); // 10 seconds of rapid fire
        break;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

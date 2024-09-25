class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 40;
    this.height = 40;
    this.speed = 50; // pixels per second
    this.direction = 1; // 1 for right, -1 for left
    this.shootProbability = 0.001; // Chance to shoot each frame
    this.color = this.getColorByType();
    this.points = this.getPointsByType();
  }

  update(deltaTime) {
    this.x += this.speed * this.direction * deltaTime;

    // Random shooting
    if (Math.random() < this.shootProbability) {
      this.shoot();
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  shoot() {
    const projectile = new Projectile(
      this.x + this.width / 2,
      this.y + this.height,
      Math.PI, // angle (straight down)
      200, // speed
      5, // radius
      "#ff0000" // color
    );
    game.projectileController.addProjectile(projectile);
  }

  getColorByType() {
    switch (this.type) {
      case "easy":
        return "#ff0000";
      case "medium":
        return "#ff7f00";
      case "hard":
        return "#ffff00";
      default:
        return "#ffffff";
    }
  }

  getPointsByType() {
    switch (this.type) {
      case "easy":
        return 10;
      case "medium":
        return 20;
      case "hard":
        return 30;
      default:
        return 5;
    }
  }

  isCollidingWith(entity) {
    return (
      this.x < entity.x + entity.width &&
      this.x + this.width > entity.x &&
      this.y < entity.y + entity.height &&
      this.y + this.height > entity.y
    );
  }

  onCollision(entity) {
    if (entity instanceof Projectile && !(entity instanceof EnemyProjectile)) {
      game.removeEntity(this);
      game.score += this.points;
    }
  }
}

class EnemyController {
  constructor(game) {
    this.game = game;
    this.enemies = [];
    this.moveDownDistance = 20;
    this.speedIncrease = 1.2;
    this.spawnInterval = 5; // seconds
    this.lastSpawnTime = 0;
  }

  init() {
    this.spawnWave();
  }

  update(deltaTime) {
    let moveDown = false;
    let leftmostX = Infinity;
    let rightmostX = -Infinity;

    this.enemies.forEach((enemy) => {
      enemy.update(deltaTime);

      // Find leftmost and rightmost enemies
      leftmostX = Math.min(leftmostX, enemy.x);
      rightmostX = Math.max(rightmostX, enemy.x + enemy.width);

      // Check if enemies should move down
      if (
        (enemy.direction === 1 && enemy.x + enemy.width > this.game.width) ||
        (enemy.direction === -1 && enemy.x < 0)
      ) {
        moveDown = true;
      }
    });

    // Move enemies down and change direction if needed
    if (moveDown) {
      this.enemies.forEach((enemy) => {
        enemy.y += this.moveDownDistance;
        enemy.direction *= -1;
        enemy.speed *= this.speedIncrease;
      });
    }

    // Spawn new wave if all enemies are destroyed
    if (this.enemies.length === 0) {
      this.spawnWave();
    }

    // Spawn additional enemies over time
    if (this.game.lastTime - this.lastSpawnTime > this.spawnInterval * 1000) {
      this.spawnEnemy();
      this.lastSpawnTime = this.game.lastTime;
    }

    // Check if enemies have reached the bottom
    if (
      this.enemies.some(
        (enemy) => enemy.y + enemy.height > this.game.height - 100
      )
    ) {
      this.game.gameOver();
    }
  }

  render(ctx) {
    this.enemies.forEach((enemy) => enemy.render(ctx));
  }

  spawnWave() {
    const rows = 5;
    const enemiesPerRow = 10;
    const startX = 50;
    const startY = 50;
    const padding = 10;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < enemiesPerRow; col++) {
        const x = startX + col * (Enemy.prototype.width + padding);
        const y = startY + row * (Enemy.prototype.height + padding);
        const type = row === 0 ? "hard" : row < 3 ? "medium" : "easy";
        const enemy = new Enemy(x, y, type);
        this.enemies.push(enemy);
        this.game.addEntity(enemy);
      }
    }
  }

  spawnEnemy() {
    const x = Math.random() * (this.game.width - Enemy.prototype.width);
    const y = 0;
    const type =
      Math.random() < 0.2 ? "hard" : Math.random() < 0.5 ? "medium" : "easy";
    const enemy = new Enemy(x, y, type);
    this.enemies.push(enemy);
    this.game.addEntity(enemy);
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  reset() {
    this.enemies.forEach((enemy) => this.game.removeEntity(enemy));
    this.enemies = [];
    this.init();
  }

  increaseLevel() {
    this.speedIncrease *= 1.1;
    this.spawnInterval *= 0.9;
    this.enemies.forEach((enemy) => {
      enemy.speed *= 1.1;
      enemy.shootProbability *= 1.1;
    });
  }
}

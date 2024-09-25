class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.speed = 300; // pixels per second
    this.color = "#00ff00";
    this.shootCooldown = 0.5; // seconds
    this.lastShootTime = 0;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isShooting = false;
    this.lives = 3;
    this.invulnerable = false;
    this.invulnerabilityTime = 2; // seconds
    this.invulnerabilityTimer = 0;
    this.blinkInterval = 0.1; // seconds
    this.blinkTimer = 0;
    this.visible = true;
  }

  update(deltaTime) {
    // Movement
    if (this.isMovingLeft) {
      this.x -= this.speed * deltaTime;
    }
    if (this.isMovingRight) {
      this.x += this.speed * deltaTime;
    }

    // Keep player within game bounds
    this.x = Math.max(0, Math.min(game.width - this.width, this.x));

    // Shooting
    if (
      this.isShooting &&
      game.lastTime - this.lastShootTime > this.shootCooldown * 1000
    ) {
      this.shoot();
      this.lastShootTime = game.lastTime;
    }

    // Invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTimer += deltaTime;
      this.blinkTimer += deltaTime;

      if (this.blinkTimer >= this.blinkInterval) {
        this.visible = !this.visible;
        this.blinkTimer = 0;
      }

      if (this.invulnerabilityTimer >= this.invulnerabilityTime) {
        this.invulnerable = false;
        this.visible = true;
      }
    }
  }

  render(ctx) {
    if (this.visible) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Draw a cannon on top of the player
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(this.x + this.width / 2 - 5, this.y - 10, 10, 10);
    }
  }

  shoot() {
    const projectile = new Projectile(
      this.x + this.width / 2,
      this.y,
      0, // angle
      -500, // speed (negative because it's moving up)
      5, // radius
      "#ffff00" // color
    );
    game.projectileController.addProjectile(projectile);
  }

  handleKeyDown(event) {
    switch (event.key) {
      case "ArrowLeft":
        this.isMovingLeft = true;
        break;
      case "ArrowRight":
        this.isMovingRight = true;
        break;
      case " ": // Spacebar
        this.isShooting = true;
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.key) {
      case "ArrowLeft":
        this.isMovingLeft = false;
        break;
      case "ArrowRight":
        this.isMovingRight = false;
        break;
      case " ": // Spacebar
        this.isShooting = false;
        break;
    }
  }

  takeDamage() {
    if (!this.invulnerable) {
      this.lives--;
      if (this.lives <= 0) {
        game.gameOver();
      } else {
        this.becomeInvulnerable();
      }
    }
  }

  becomeInvulnerable() {
    this.invulnerable = true;
    this.invulnerabilityTimer = 0;
  }

  reset() {
    this.x = game.width / 2 - this.width / 2;
    this.y = game.height - this.height - 20;
    this.lives = 3;
    this.invulnerable = false;
    this.visible = true;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isShooting = false;
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
    if (entity instanceof Enemy || entity instanceof EnemyProjectile) {
      this.takeDamage();
    }
  }

  onResize(gameWidth, gameHeight) {
    // Adjust player position if necessary
    this.x = Math.min(this.x, gameWidth - this.width);
    this.y = gameHeight - this.height - 20;
  }
}

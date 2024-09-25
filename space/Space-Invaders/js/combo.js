class ComboSystem {
  constructor(game) {
    this.game = game;
    this.comboCount = 0;
    this.comboLevel = 1;
    this.lastKillTime = 0;
    this.comboTimer = 5000; // 5 seconds
  }

  incrementCombo() {
    const currentTime = performance.now();
    if (currentTime - this.lastKillTime <= this.comboTimer) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastKillTime = currentTime;
    this.updateComboLevel();
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboLevel = 1;
  }

  updateComboLevel() {
    if (this.comboCount >= 41) {
      this.comboLevel = 5;
    } else if (this.comboCount >= 31) {
      this.comboLevel = 4;
    } else if (this.comboCount >= 21) {
      this.comboLevel = 3;
    } else if (this.comboCount >= 11) {
      this.comboLevel = 2;
    } else {
      this.comboLevel = 1;
    }
    // Adjust player's fire rate based on combo level
    this.game.player.fireRate =
      this.game.player.baseFireRate * (1 + 0.2 * (this.comboLevel - 1));
  }

  update(currentTime) {
    if (currentTime - this.lastKillTime > this.comboTimer) {
      this.resetCombo();
    }
  }

  render(ctx) {
    // Draw combo meter
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Combo: x${this.comboLevel} (${this.comboCount})`,
      this.game.canvas.width / 2,
      30
    );

    // Draw combo timer bar
    const timeLeft = Math.max(
      0,
      this.comboTimer - (performance.now() - this.lastKillTime)
    );
    const barWidth = 200;
    const barHeight = 10;
    ctx.fillStyle = "yellow";
    ctx.fillRect(
      this.game.canvas.width / 2 - barWidth / 2,
      40,
      (barWidth * timeLeft) / this.comboTimer,
      barHeight
    );
    ctx.strokeStyle = "white";
    ctx.strokeRect(
      this.game.canvas.width / 2 - barWidth / 2,
      40,
      barWidth,
      barHeight
    );
  }
}

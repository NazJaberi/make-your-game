class ComboSystem {
  constructor(game) {
    this.game = game;
    this.comboCount = 0;
    this.comboLevel = 1;
    this.lastKillTime = 0;
    this.comboTimer = 5000; // 5 seconds

    // Create DOM elements
    this.comboElement = document.createElement("div");
    this.comboElement.className = "combo-meter";
    this.comboElement.style.position = "absolute";
    this.comboElement.style.top = "10px";
    this.comboElement.style.left = "50%";
    this.comboElement.style.transform = "translateX(-50%)";
    this.comboElement.style.textAlign = "center";
    this.comboElement.style.color = "white";
    this.comboElement.style.font = "20px Arial";

    this.comboTimerBar = document.createElement("div");
    this.comboTimerBar.className = "combo-timer-bar";
    this.comboTimerBar.style.position = "absolute";
    this.comboTimerBar.style.top = "40px";
    this.comboTimerBar.style.left = "50%";
    this.comboTimerBar.style.transform = "translateX(-50%)";
    this.comboTimerBar.style.width = "200px";
    this.comboTimerBar.style.height = "10px";
    this.comboTimerBar.style.backgroundColor = "yellow";
    this.comboTimerBar.style.border = "1px solid white";

    // Add elements to the game container
    this.game.container.appendChild(this.comboElement);
    this.game.container.appendChild(this.comboTimerBar);
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
    this.render();
  }

  render() {
    // Update combo text
    this.comboElement.textContent = `Combo: x${this.comboLevel} (${this.comboCount})`;

    // Update combo timer bar
    const timeLeft = Math.max(
      0,
      this.comboTimer - (performance.now() - this.lastKillTime)
    );
    const barWidth = 200;
    const fillWidth = (barWidth * timeLeft) / this.comboTimer;
    this.comboTimerBar.style.width = `${fillWidth}px`;
  }
}

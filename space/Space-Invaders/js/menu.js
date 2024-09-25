class MenuManager {
  constructor(game) {
    this.game = game;
    this.currentMenu = null;
    this.buttonHoverIndex = -1;
  }

  showMenu(menuName) {
    this.currentMenu = menuName;
    console.log(`Showing menu: ${menuName}`);
  }

  hideMenu() {
    this.currentMenu = null;
  }

  handleClick(x, y) {
    switch (this.currentMenu) {
      case "main":
        if (
          this.isPointInButton(
            x,
            y,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 50
          )
        ) {
          this.game.showCharacterSelect();
        }
        break;
      case "characterSelect":
        const canvasWidth = this.game.canvas.width;
        const characterCount = this.game.playerTypes.length;
        const characterWidth = 220;
        const characterHeight = 350;
        const totalWidth = characterCount * characterWidth;
        const startX = (canvasWidth - totalWidth) / 2;
        const centerY = this.game.canvas.height / 2 - 50;

        this.game.playerTypes.forEach((type, index) => {
          const charX = startX + index * characterWidth;
          const charY = centerY - characterHeight / 2;

          if (
            x >= charX &&
            x < charX + characterWidth &&
            y >= charY &&
            y < charY + characterHeight
          ) {
            this.game.selectedPlayerIndex = index;
            this.game.startGame();
          }
        });
        break;
      case "pause":
        if (
          this.isPointInButton(
            x,
            y,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 - 20
          )
        ) {
          this.game.resumeGame();
        } else if (
          this.isPointInButton(
            x,
            y,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 60
          )
        ) {
          this.game.returnToMainMenu();
        }
        break;
      case "gameOver":
        if (
          this.isPointInButton(
            x,
            y,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2 + 50
          )
        ) {
          this.game.returnToMainMenu();
        }
        break;
    }
  }

  handleMouseMove(x, y) {
    this.buttonHoverIndex = -1;
    if (this.currentMenu === "characterSelect") {
      const canvasWidth = this.game.canvas.width;
      const characterCount = this.game.playerTypes.length;
      const characterWidth = 220;
      const characterHeight = 350;
      const totalWidth = characterCount * characterWidth;
      const startX = (canvasWidth - totalWidth) / 2;
      const centerY = this.game.canvas.height / 2 - 50;

      this.game.playerTypes.forEach((type, index) => {
        const charX = startX + index * characterWidth;
        const charY = centerY - characterHeight / 2;

        if (
          x >= charX &&
          x < charX + characterWidth &&
          y >= charY &&
          y < charY + characterHeight
        ) {
          this.buttonHoverIndex = index;
        }
      });
    }
  }
  isPointInButton(x, y, buttonX, buttonY) {
    return Math.abs(x - buttonX) < 60 && Math.abs(y - buttonY) < 20;
  }

  render(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";

    switch (this.currentMenu) {
      case "main":
        this.renderMainMenu(ctx);
        break;
      case "characterSelect":
        this.renderCharacterSelect(ctx);
        break;
      case "pause":
        this.renderPauseMenu(ctx);
        break;
      case "gameOver":
        this.renderGameOver(ctx);
        break;
    }
  }

  renderMainMenu(ctx) {
    ctx.fillText(
      "Space Invaders",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 - 50
    );
    this.renderButton(
      ctx,
      "Start Game",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 + 50
    );
  }

  renderCharacterSelect(ctx) {
    const canvasWidth = this.game.canvas.width;
    const canvasHeight = this.game.canvas.height;

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Select Your Character", canvasWidth / 2, 80);

    const characterCount = this.game.playerTypes.length;
    const characterWidth = 220;
    const characterHeight = 350;
    const totalWidth = characterCount * characterWidth;
    const startX = (canvasWidth - totalWidth) / 2;

    this.game.playerTypes.forEach((type, index) => {
      const x = startX + index * characterWidth + characterWidth / 2;
      const y = canvasHeight / 2 - 50;

      // Draw character box
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(
        x - characterWidth / 2,
        y - characterHeight / 2,
        characterWidth,
        characterHeight
      );

      // Glow effect for hover state
      if (index === this.buttonHoverIndex) {
        ctx.shadowColor = type.color;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = type.color;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "white";
      }

      ctx.lineWidth = 2;
      ctx.strokeRect(
        x - characterWidth / 2,
        y - characterHeight / 2,
        characterWidth,
        characterHeight
      );

      // Reset shadow for text and images
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Draw character name
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      const nameParts = type.name.split(" ");
      nameParts.forEach((part, i) => {
        ctx.fillText(part, x, y - characterHeight / 2 + 30 + i * 25);
      });

      // Draw the actual spaceship
      const imageName = type.name.toLowerCase().replace(/\s+/g, "");
      if (this.game.assets[imageName]) {
        ctx.drawImage(this.game.assets[imageName], x - 50, y - 70, 100, 100);
      } else {
        console.log(`Asset not found for ${type.name} (${imageName})`);
      }

      // Draw character stats
      ctx.font = "16px Arial";
      ctx.textAlign = "left";
      const stats = [
        `Speed: ${type.stats.speed}`,
        `Fire Rate: ${type.stats.fireRate}`,
        `Damage: ${type.stats.damage}`,
        `Health: ${type.stats.health}`,
        `Defense: ${type.stats.defense}`,
      ];
      stats.forEach((stat, statIndex) => {
        ctx.fillText(
          stat,
          x - characterWidth / 2 + 10,
          y + 50 + statIndex * 25
        );
      });
    });
  }

  hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
          result[3],
          16
        )}`
      : null;
  }

  renderPauseMenu(ctx) {
    ctx.fillText(
      "Paused",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 - 100
    );
    this.renderButton(
      ctx,
      "Resume",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 - 20
    );
    this.renderButton(
      ctx,
      "Main Menu",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 + 60
    );
  }

  renderGameOver(ctx) {
    ctx.fillText(
      "Game Over",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 - 50
    );
    ctx.fillText(
      `Score: ${this.game.score}`,
      this.game.canvas.width / 2,
      this.game.canvas.height / 2
    );
    this.renderButton(
      ctx,
      "Return to Main Menu",
      this.game.canvas.width / 2,
      this.game.canvas.height / 2 + 50
    );
  }

  renderButton(ctx, text, x, y, isHovered = false) {
    ctx.fillStyle = isHovered
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(x - 60, y - 20, 120, 40);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 60, y - 20, 120, 40);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y + 7);
  }
}

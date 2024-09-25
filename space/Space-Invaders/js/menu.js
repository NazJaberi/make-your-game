class MenuManager {
  constructor(game) {
    this.game = game;
    this.currentMenu = null;
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
        this.game.showCharacterSelect();
        break;
      case "characterSelect":
        const clickedIndex = Math.floor((y - 150) / 100);
        if (clickedIndex >= 0 && clickedIndex < this.game.playerTypes.length) {
          this.game.selectedPlayerIndex = clickedIndex;
          this.game.startGame();
        }
        break;
      case "pause":
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        if (Math.abs(x - centerX) < 100) {
          if (Math.abs(y - (centerY - 20)) < 20) {
            this.game.resumeGame();
          } else if (Math.abs(y - (centerY + 60)) < 20) {
            this.game.returnToMainMenu();
          }
        }
        break;
      case "gameOver":
        this.game.returnToMainMenu();
        break;
    }
  }

  render(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    switch (this.currentMenu) {
      case "main":
        ctx.fillText(
          "Space Invaders",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 50
        );
        ctx.fillText(
          "Click to Start",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 + 50
        );
        break;
      case "characterSelect":
        ctx.fillText("Select Your Character", this.game.canvas.width / 2, 100);
        this.game.playerTypes.forEach((type, index) => {
          const y = 200 + index * 100;
          ctx.fillStyle =
            index === this.game.selectedPlayerIndex ? "yellow" : "white";
          ctx.fillText(type.name, this.game.canvas.width / 2, y);
          ctx.fillStyle = type.color;
          ctx.fillRect(this.game.canvas.width / 2 - 25, y + 10, 50, 50);
        });
        break;
      case "pause":
        ctx.fillText(
          "Paused",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 100
        );
        ctx.fillText(
          "Resume",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 - 20
        );
        ctx.fillText(
          "Main Menu",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 + 60
        );
        break;
      case "gameOver":
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
        ctx.fillText(
          "Click to Return to Main Menu",
          this.game.canvas.width / 2,
          this.game.canvas.height / 2 + 50
        );
        break;
    }
  }
}

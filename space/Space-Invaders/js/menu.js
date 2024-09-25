class MenuManager {
  constructor(game) {
    this.game = game;
    this.currentMenu = null;
    this.menus = {
      main: new MainMenu(this),
      pause: new PauseMenu(this),
      gameOver: new GameOverMenu(this),
    };
    this.showMenu("main"); // Show main menu by default
  }

  showMenu(menuName) {
    if (this.menus[menuName]) {
      this.currentMenu = this.menus[menuName];
      this.currentMenu.show();
      console.log(`Showing ${menuName} menu`);
    }
  }

  hideMenu() {
    if (this.currentMenu) {
      this.currentMenu.hide();
      this.currentMenu = null;
      console.log("Hiding menu");
    }
  }

  update() {
    if (this.currentMenu) {
      this.currentMenu.update();
    }
  }

  render(ctx) {
    if (this.currentMenu) {
      this.currentMenu.render(ctx);
    }
  }

  handleClick(x, y) {
    console.log(`MenuManager handling click at (${x}, ${y})`);
    if (this.currentMenu) {
      console.log(`Current menu: ${this.currentMenu.constructor.name}`);
      this.currentMenu.handleClick(x, y);
    } else {
      console.log("No current menu");
    }
  }

  isMenuVisible() {
    return this.currentMenu !== null;
  }
}

class Menu {
  constructor(manager) {
    this.manager = manager;
    this.buttons = [];
  }

  show() {
    console.log(`Showing ${this.constructor.name}`);
  }

  hide() {
    console.log(`Hiding ${this.constructor.name}`);
  }

  update() {
    // To be implemented in subclasses if needed
  }

  render(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.manager.game.width, this.manager.game.height);

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.title, this.manager.game.width / 2, 100);

    this.buttons.forEach((button) => button.render(ctx));
  }

  handleClick(x, y) {
    console.log(`Menu ${this.constructor.name} handling click`);
    this.buttons.forEach((button, index) => {
      console.log(`Checking button ${index}: ${button.text}`);
      if (button.isClicked(x, y)) {
        console.log(`Button ${button.text} clicked`);
        button.onClick();
      }
    });
  }
}

class MainMenu extends Menu {
  constructor(manager) {
    super(manager);
    this.title = "Space Invaders";
    this.buttons = [
      new Button(
        this.manager.game.width / 2,
        200,
        200,
        50,
        "Start Game",
        () => {
          this.manager.hideMenu();
          this.manager.game.startGame();
        }
      ),
      new Button(
        this.manager.game.width / 2,
        270,
        200,
        50,
        "High Scores",
        () => {
          console.log("High Scores clicked");
        }
      ),
      new Button(this.manager.game.width / 2, 340, 200, 50, "Options", () => {
        console.log("Options clicked");
      }),
    ];
  }

  render(ctx) {
    console.log("Rendering MainMenu");
    super.render(ctx);
  }
}

class PauseMenu extends Menu {
  constructor(manager) {
    super(manager);
    this.title = "Paused";
    this.buttons = [
      new Button(this.manager.game.width / 2, 200, 200, 50, "Resume", () => {
        this.manager.hideMenu();
        this.manager.game.resumeGame();
      }),
      new Button(this.manager.game.width / 2, 270, 200, 50, "Restart", () => {
        this.manager.hideMenu();
        this.manager.game.restartGame();
      }),
      new Button(this.manager.game.width / 2, 340, 200, 50, "Main Menu", () => {
        this.manager.showMenu("main");
        this.manager.game.endGame();
      }),
    ];
  }
}

class GameOverMenu extends Menu {
  constructor(manager) {
    super(manager);
    this.title = "Game Over";
    this.buttons = [
      new Button(
        this.manager.game.width / 2,
        200,
        200,
        50,
        "Play Again",
        () => {
          this.manager.hideMenu();
          this.manager.game.restartGame();
        }
      ),
      new Button(this.manager.game.width / 2, 270, 200, 50, "Main Menu", () => {
        this.manager.showMenu("main");
      }),
    ];
  }

  render(ctx) {
    super.render(ctx);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(
      `Score: ${this.manager.game.score}`,
      this.manager.game.width / 2,
      150
    );
  }
}

class Button {
  constructor(x, y, width, height, text, onClick) {
    this.x = x - width / 2;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
    this.onClick = onClick;
  }

  render(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }

  isClicked(clickX, clickY) {
    const clicked =
      clickX >= this.x &&
      clickX <= this.x + this.width &&
      clickY >= this.y &&
      clickY <= this.y + this.height;
    console.log(`Button "${this.text}" clicked: ${clicked}`);
    return clicked;
  }
}

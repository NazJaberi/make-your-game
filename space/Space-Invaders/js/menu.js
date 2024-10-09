class MenuManager {
  constructor(game) {
    this.game = game;
    this.currentMenu = null;
    this.buttonHoverIndex = -1;
    this.menuContainer = document.createElement("div");
    this.menuContainer.className = "menu-container";
    this.menuContainer.style.position = "absolute";
    this.menuContainer.style.top = "0";
    this.menuContainer.style.left = "0";
    this.menuContainer.style.width = "100%";
    this.menuContainer.style.height = "100%";
    this.menuContainer.style.display = "none";
    this.game.container.appendChild(this.menuContainer);
  }

  showMenu(menuName) {
    this.currentMenu = menuName;
    this.menuContainer.style.display = "block";
    this.renderMenu();
    console.log(`Showing menu: ${menuName}`);
  }

  hideMenu() {
    this.currentMenu = null;
    this.menuContainer.style.display = "none";
  }

  handleClick(x, y) {
    const clickEvent = new MouseEvent("click", {
      clientX: x,
      clientY: y,
    });
    this.menuContainer.dispatchEvent(clickEvent);
  }

  handleMouseMove(x, y) {
    const moveEvent = new MouseEvent("mousemove", {
      clientX: x,
      clientY: y,
    });
    this.menuContainer.dispatchEvent(moveEvent);
  }

  renderMenu() {
    this.menuContainer.innerHTML = "";
    switch (this.currentMenu) {
      case "main":
        this.renderMainMenu();
        break;
      case "characterSelect":
        this.renderCharacterSelect();
        break;
      case "pause":
        this.renderPauseMenu();
        break;
      case "gameOver":
        this.renderGameOver();
        break;
    }
  }

  renderMainMenu() {
    const title = document.createElement("h1");
    title.textContent = "Space Invaders";
    title.style.textAlign = "center";
    title.style.marginTop = "20%";

    const startButton = this.createButton("Start Game", () => {
      this.game.showCharacterSelect();
    });

    this.menuContainer.appendChild(title);
    this.menuContainer.appendChild(startButton);
  }

  renderCharacterSelect() {
    const title = document.createElement("h2");
    title.textContent = "Select Your Character";
    title.style.textAlign = "center";

    const characterContainer = document.createElement("div");
    characterContainer.style.display = "flex";
    characterContainer.style.justifyContent = "center";
    characterContainer.style.flexWrap = "wrap";

    this.game.playerTypes.forEach((type, index) => {
      const charBox = document.createElement("div");
      charBox.className = "character-box";
      charBox.style.width = "220px";
      charBox.style.height = "350px";
      charBox.style.margin = "10px";
      charBox.style.border = "2px solid white";
      charBox.style.borderRadius = "10px";
      charBox.style.padding = "10px";
      charBox.style.cursor = "pointer";

      const charName = document.createElement("h3");
      charName.textContent = type.name;
      charName.style.textAlign = "center";

      const charImage = document.createElement("img");
      charImage.src =
        this.game.assets[type.name.toLowerCase().replace(/\s+/g, "")].src;
      charImage.style.width = "100px";
      charImage.style.height = "100px";
      charImage.style.display = "block";
      charImage.style.margin = "0 auto";

      const statsList = document.createElement("ul");
      Object.entries(type.stats).forEach(([key, value]) => {
        const statItem = document.createElement("li");
        statItem.textContent = `${key}: ${value}`;
        statsList.appendChild(statItem);
      });

      charBox.appendChild(charName);
      charBox.appendChild(charImage);
      charBox.appendChild(statsList);

      charBox.addEventListener("click", () => {
        this.game.selectedPlayerIndex = index;
        this.game.startGame();
      });

      charBox.addEventListener("mouseover", () => {
        charBox.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      });

      charBox.addEventListener("mouseout", () => {
        charBox.style.backgroundColor = "transparent";
      });

      characterContainer.appendChild(charBox);
    });

    this.menuContainer.appendChild(title);
    this.menuContainer.appendChild(characterContainer);
  }

  renderPauseMenu() {
    const title = document.createElement("h2");
    title.textContent = "Paused";
    title.style.textAlign = "center";

    const resumeButton = this.createButton("Resume", () => {
      this.game.resumeGame();
    });

    const mainMenuButton = this.createButton("Main Menu", () => {
      this.game.returnToMainMenu();
    });

    this.menuContainer.appendChild(title);
    this.menuContainer.appendChild(resumeButton);
    this.menuContainer.appendChild(mainMenuButton);
  }

  renderGameOver() {
    const title = document.createElement("h2");
    title.textContent = "Game Over";
    title.style.textAlign = "center";

    const score = document.createElement("p");
    score.textContent = `Score: ${this.game.score}`;
    score.style.textAlign = "center";

    const mainMenuButton = this.createButton("Return to Main Menu", () => {
      this.game.returnToMainMenu();
    });

    this.menuContainer.appendChild(title);
    this.menuContainer.appendChild(score);
    this.menuContainer.appendChild(mainMenuButton);
  }

  createButton(text, onClick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.style.display = "block";
    button.style.margin = "10px auto";
    button.style.padding = "10px 20px";
    button.style.fontSize = "18px";
    button.style.cursor = "pointer";
    button.addEventListener("click", onClick);
    return button;
  }
}

class Scoreboard {
  constructor(game) {
    this.game = game;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.level = 1;
    this.lives = 3;
    this.timeElapsed = 0;
  }

  update(deltaTime) {
    this.timeElapsed += deltaTime;
  }

  render(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Score
    ctx.fillText(`Score: ${this.score}`, 10, 10);

    // High Score
    ctx.fillText(`High Score: ${this.highScore}`, 10, 40);

    // Level
    ctx.fillText(`Level: ${this.level}`, 10, 70);

    // Lives
    ctx.fillText(`Lives: ${"❤️".repeat(this.lives)}`, 10, 100);

    // Time
    const minutes = Math.floor(this.timeElapsed / 60);
    const seconds = Math.floor(this.timeElapsed % 60);
    ctx.fillText(
      `Time: ${minutes}:${seconds.toString().padStart(2, "0")}`,
      10,
      130
    );
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  resetScore() {
    this.score = 0;
  }

  increaseLevel() {
    this.level++;
  }

  decreaseLives() {
    this.lives--;
    return this.lives <= 0;
  }

  resetLives() {
    this.lives = 3;
  }

  resetTime() {
    this.timeElapsed = 0;
  }

  reset() {
    this.resetScore();
    this.resetLives();
    this.resetTime();
    this.level = 1;
  }

  loadHighScore() {
    const savedHighScore = localStorage.getItem("highScore");
    return savedHighScore ? parseInt(savedHighScore, 10) : 0;
  }

  saveHighScore() {
    localStorage.setItem("highScore", this.highScore.toString());
  }

  getGameStats() {
    return {
      score: this.score,
      highScore: this.highScore,
      level: this.level,
      lives: this.lives,
      timeElapsed: this.timeElapsed,
    };
  }
}

class HighScoreManager {
  constructor() {
    this.highScores = this.loadHighScores();
  }

  addHighScore(name, score) {
    this.highScores.push({ name, score });
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10); // Keep only top 10
    this.saveHighScores();
  }

  getHighScores() {
    return this.highScores;
  }

  loadHighScores() {
    const savedHighScores = localStorage.getItem("highScores");
    return savedHighScores ? JSON.parse(savedHighScores) : [];
  }

  saveHighScores() {
    localStorage.setItem("highScores", JSON.stringify(this.highScores));
  }

  renderHighScores(ctx) {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("High Scores", this.game.width / 2, 50);

    ctx.font = "18px Arial";
    this.highScores.forEach((score, index) => {
      ctx.fillText(
        `${index + 1}. ${score.name}: ${score.score}`,
        this.game.width / 2,
        100 + index * 30
      );
    });
  }
}

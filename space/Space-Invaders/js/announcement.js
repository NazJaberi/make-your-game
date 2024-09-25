class Announcement {
  constructor(message, duration = 3000) {
    this.message = message;
    this.duration = duration;
    this.startTime = performance.now();
    this.opacity = 1;
  }

  update(currentTime) {
    const elapsedTime = currentTime - this.startTime;
    if (elapsedTime > this.duration) {
      return false; // Announcement has expired
    }
    if (elapsedTime > this.duration - 1000) {
      this.opacity = 1 - (elapsedTime - (this.duration - 1000)) / 1000;
    }
    return true;
  }

  render(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.message, canvasWidth / 2, canvasHeight / 4);
    ctx.restore();
  }
}

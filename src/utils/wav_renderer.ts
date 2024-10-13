export class WavRenderer {
  static drawBars(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    frequencies: number[],
    color: string,
    barWidth: number,
    barSpacing: number,
    heightMultiplier: number
  ) {
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;

    ctx.fillStyle = color;

    const barCount = Math.floor(canvasWidth / (barWidth + barSpacing));
    const frequencyStep = Math.floor(frequencies.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const frequency = frequencies[i * frequencyStep];
      const barHeight = Math.min(frequency * heightMultiplier, canvasHeight);
      const x = i * (barWidth + barSpacing);
      const y = canvasHeight - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}

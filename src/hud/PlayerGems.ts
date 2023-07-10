class PlayerGems extends ex.ScreenElement {
  constructor() {
    super({
      x: 50,
      y: 50,
    });
  }

  onInitialize() {
    this.graphics.add('idle', Resources.StartButtonBackground);
    this.graphics.add('hover', Resources.StartButtonHovered);

    this.on('pointerup', () => {
      alert("I've been clicked");
    });

    this.on('pointerenter', () => {
      this.graphics.show('hover');
    });

    this.on('pointerleave', () => {
      this.graphics.show('idle');
    });
  }
}

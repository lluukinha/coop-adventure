import * as ex from "excalibur";
import { Images } from "../resources";
import { TAG_PLAYER_GEMS, TAG_PLAYER_HUD } from "../constants";

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.fontImage,
  grid: {
    rows: 3,
    columns: 16,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const spriteFont = new ex.SpriteFont({
  alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,!'&.\"?-()+ ",
  caseInsensitive: true,
  spriteSheet: spriteSheet,
  spacing: -6,
});

const MAX_QUANTITY = 99999;

export class PlayerGemsQuantity extends ex.ScreenElement {
  gems: number;
  constructor(gems: number) {
    super({
      y: 20,
      scale: new ex.Vector(3, 3),
      z: 99,
    });
    this.gems = gems;
  }

  updateQuantity(increment: number) {
    const newNumber =
      this.gems + increment >= MAX_QUANTITY
        ? MAX_QUANTITY
        : this.gems + increment;
    const text = new ex.Text({
      text: `${newNumber}`,
      font: spriteFont,
    });
    this.gems = newNumber;
    this.graphics.use(text);
  }

  onInitialize(_engine: ex.Engine) {
    this.pos.x = _engine.canvas.width - 180;
    this.addTag(TAG_PLAYER_GEMS);
    this.addTag(TAG_PLAYER_HUD);
    this.updateQuantity(this.gems);
  }
}

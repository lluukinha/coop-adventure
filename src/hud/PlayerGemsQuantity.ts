import * as ex from 'excalibur';
import { Images } from '../resources';
import { TAG_PLAYER_GEMS, TAG_PLAYER_HUD } from '../constants';

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
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,!\'&."?-()+ ',
  caseInsensitive: true,
  spriteSheet: spriteSheet,
  spacing: -6,
});

export class PlayerGemsQuantity extends ex.ScreenElement {
  gems: string | number;
  constructor(gems: number) {
    super({
      x: 70,
      y: 25,
      scale: new ex.Vector(3, 3),
    });
    this.gems = gems;
  }

  updateQuantity(newText: string | number) {
    const text = new ex.Text({
      text: `${newText}`,
      font: spriteFont,
    });
    this.gems = newText;
    this.graphics.use(text);
  }

  onInitialize() {
    this.addTag(TAG_PLAYER_GEMS);
    this.addTag(TAG_PLAYER_HUD);
    this.updateQuantity(this.gems);
  }
}

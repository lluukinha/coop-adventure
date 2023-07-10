import { TAG_PLAYER_HUD } from '../constants';
import { Images } from '../resources';
import * as ex from 'excalibur';

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.blueGemSheetImage,
  grid: {
    columns: 4,
    rows: 1,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const ANIMATION_SPEED = 150;

export class PlayerGems extends ex.ScreenElement {
  constructor() {
    super({
      x: 30,
      y: 30,
      scale: new ex.Vector(3, 3),
    });
  }

  onInitialize(_engine: ex.Engine) {
    this.addTag(TAG_PLAYER_HUD);
    const animation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      ex.range(0, 3),
      ANIMATION_SPEED
    );
    animation.strategy = ex.AnimationStrategy.Loop;
    this.graphics.use(animation);
  }
}

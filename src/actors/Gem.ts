import * as ex from 'excalibur';
import { Images, Sounds } from '../resources.js';
import { ANCHOR_CENTER, TAG_COIN } from '../constants.js';

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.blueGemSheetImage,
  grid: {
    columns: 4,
    rows: 1,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const ANIMATION_SPEED = 80;

export class Gem extends ex.Actor {
  sound: ex.Sound;
  experience: number;
  constructor(x: number, y: number, experience: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: new ex.Vector(0.8, 0.8),
      collider: ex.Shape.Box(3, 3, ANCHOR_CENTER, new ex.Vector(0, 4)),
      collisionType: ex.CollisionType.Passive,
      z: 1,
    });

    this.experience = experience;
    this.sound = Sounds.coinSound;

    // Do the animation, then remove instance after it's done
    const animation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      ex.range(0, 3),
      ANIMATION_SPEED
    );
    animation.strategy = ex.AnimationStrategy.Loop;
    this.graphics.add('gem', animation);
    this.graphics.use(animation);
    this.addTag(TAG_COIN);
  }
}

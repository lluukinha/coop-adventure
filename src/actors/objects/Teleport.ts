import * as ex from 'excalibur';
import { Images } from '../../resources.js';
import { ANCHOR_CENTER, TAG_MONSTER, TAG_TELEPORT } from '../../constants.js';

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.coinSheetImage,
  grid: {
    columns: 12,
    rows: 1,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const ANIMATION_SPEED = 80;

export class Teleport extends ex.Actor {
  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: new ex.Vector(0.8, 0.8),
      collider: ex.Shape.Box(3, 3, ANCHOR_CENTER, new ex.Vector(0, 4)),
      collisionType: ex.CollisionType.Passive,
      z: 1,
      visible: false,
    });

    // Do the animation, then remove instance after it's done
    const animation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      ex.range(0, 11),
      ANIMATION_SPEED
    );
    animation.strategy = ex.AnimationStrategy.Loop;
    this.graphics.add('teleport', animation);
    this.graphics.use(animation);
    this.addTag(TAG_TELEPORT);
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    const monsters = _engine.currentScene.actors.filter((a) =>
      a.hasTag(TAG_MONSTER)
    );
    if (monsters.length === 0) {
      this.graphics.visible = true;
    }
  }
}

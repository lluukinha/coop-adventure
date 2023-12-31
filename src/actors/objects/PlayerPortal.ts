import * as ex from 'excalibur';
import { Images, Sounds } from '../../resources.js';
import { ANCHOR_CENTER, SCALE_3x, TAG_ANY_PLAYER } from '../../constants.js';
import { Player } from '../players/Player.js';

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.greenPortalSheetImage,
  grid: {
    columns: 8,
    rows: 3,
    spriteWidth: 64,
    spriteHeight: 64,
  },
});

const ANIMATION_SPEED = 80;

export class PlayerPortal extends ex.Actor {
  public animations: { [key: string]: ex.Animation };
  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_3x,
      collider: ex.Shape.Box(3, 3, ANCHOR_CENTER, new ex.Vector(0, 4)),
      collisionType: ex.CollisionType.Passive,
      z: 1,
      visible: true,
    });

    this.animations = {
      appearing: ex.Animation.fromSpriteSheet(
        spriteSheet,
        ex.range(8, 15),
        ANIMATION_SPEED
      ),
      disappearing: ex.Animation.fromSpriteSheet(
        spriteSheet,
        ex.range(16, 23),
        ANIMATION_SPEED
      ),
    };

    this.animations.appearing.strategy = ex.AnimationStrategy.End;
    this.animations.disappearing.strategy = ex.AnimationStrategy.End;
    Sounds.teleportSound.play();
  }

  onInitialize(_engine: ex.Engine): void {
    const player = this.scene.actors.find((a) => a.hasTag(TAG_ANY_PLAYER)) as Player;
    this.animations.appearing.events.on('end', () => {
      player.resume();
      this.graphics.use(this.animations.disappearing);
    });

    this.animations.disappearing.events.on('end', () => {
      this.kill();
    });

    this.graphics.use(this.animations.appearing);
    player.graphics.opacity = 0;
    player.graphics.visible = true;
    player.actions.fade(1, 1000);
  }
}

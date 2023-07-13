import * as ex from "excalibur";
import { Images } from "../../resources.js";
import {
  ANCHOR_CENTER,
  SCALE_2x,
  TAG_ANY_PLAYER,
  TAG_MONSTER,
  TAG_POWERUP,
} from "../../constants.js";
import { Player } from "../players/Player.js";

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.bibleSheetImage,
  grid: {
    columns: 1,
    rows: 1,
    spriteWidth: 64,
    spriteHeight: 59,
  },
});

const ANIMATION_SPEED = 80;

export class Bible extends ex.Actor {
  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
      collider: ex.Shape.Box(10, 10, ANCHOR_CENTER),
      collisionType: ex.CollisionType.Passive,
      z: 1,
    });

    // Do the animation, then remove instance after it's done
    const animation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      ex.range(0, 0),
      ANIMATION_SPEED
    );
    animation.strategy = ex.AnimationStrategy.Loop;
    this.graphics.add("bible", animation);
    this.graphics.use(animation);

    this.graphics.opacity = 0;

    this.addTag(TAG_POWERUP);

    this.on("collisionstart", (event) => this.onCollisionStart(event));
  }

  onPostUpdate(_engine: ex.Engine, _delta: number): void {
    const monsters = _engine.currentScene.actors.filter((a) =>
      a.hasTag(TAG_MONSTER)
    );
    if (monsters.length === 0) {
      this.actions.fade(1, 500);
      this.graphics.visible = true;
    } else {
      this.graphics.visible = false;
    }
  }

  onCollisionStart(event: ex.CollisionStartEvent<ex.Actor>) {
    if (event.other.hasTag(TAG_ANY_PLAYER) && this.graphics.visible) {
      const player = event.other as Player;
      player.pray();
      this.kill();
    }
  }
}

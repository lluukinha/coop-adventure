import * as ex from "excalibur";
import { SCALE_4x } from "../constants.js";
import { Images } from "../resources.js";
import { Gem } from "./Gem.js";

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.explosionSheetImage,
  grid: {
    columns: 7,
    rows: 1,
    spriteWidth: 32,
    spriteHeight: 32,
  },
});

const EXPLOSION_ANIMATION_SPEED = 80;

export class Explosion extends ex.Actor {
  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 32,
      height: 32,
      scale: SCALE_4x,
      z: 99,
    });

    // Do the animation, then remove instance after it's done
    const explodeAnimation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      ex.range(0, 6),
      EXPLOSION_ANIMATION_SPEED
    );
    explodeAnimation.strategy = ex.AnimationStrategy.End;
    this.graphics.add("explode", explodeAnimation);
    this.graphics.use(explodeAnimation);
    explodeAnimation.events.on("end", () => {
      this.kill();
      const gem = new Gem(this.pos.x, this.pos.y, 1);
      this.scene.engine.add(gem);
    });
  }
}

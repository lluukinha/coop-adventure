import * as ex from "excalibur";
import { Images, Sounds } from "../resources.js";
import {
  ANCHOR_CENTER,
  SCALE_3x,
  TAG_ANY_PLAYER,
  TAG_COIN,
  TAG_PLAYER_GEMS,
} from "../constants.js";
import { Player } from "./players/Player.js";
import { PlayerGemsQuantity } from "../hud/PlayerGemsQuantity.js";

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
  value: number;
  constructor(x: number, y: number, value: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_3x,
      collider: ex.Shape.Box(10, 10, ANCHOR_CENTER),
      collisionType: ex.CollisionType.Passive,
      z: 1,
    });

    this.value = value;
    this.sound = Sounds.coinSound;

    // Do the animation, then remove instance after it's done
    const animation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      ex.range(0, 3),
      ANIMATION_SPEED
    );
    animation.strategy = ex.AnimationStrategy.Loop;
    this.graphics.add("gem", animation);
    this.graphics.use(animation);
    this.addTag(TAG_COIN);

    this.on("collisionstart", (event) => this.onCollisionStart(event));
  }

  onCollisionStart(event: ex.CollisionStartEvent) {
    if (event.other.hasTag(TAG_ANY_PLAYER)) {
      const player = event.other as Player;
      this.updateGemsCounter(player);
    }
  }

  updateGemsCounter(player: Player) {
    this.sound.play();
    player.gems += this.value;

    const gemHudCounter = this.scene.actors.find((a) =>
      a.hasTag(TAG_PLAYER_GEMS)
    ) as PlayerGemsQuantity;
    gemHudCounter.updateQuantity(this.value);
    this.kill();
  }
}

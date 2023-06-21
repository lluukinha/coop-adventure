import * as ex from "excalibur";
import { Images } from "../../resources.js";
import {
  DOWN,
  LEFT,
  RIGHT,
  SCALE,
  SCALE_2x,
  TAG_PLAYER_WEAPON,
  UP,
} from "../../constants.js";
import { Player } from "../players/Player.js";

const arrowSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.arrowSheetImage,
  grid: {
    columns: 1,
    rows: 4,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const arrowDownAnim = ex.Animation.fromSpriteSheet(arrowSpriteSheet, [0], 100);
const arrowUpAnim = ex.Animation.fromSpriteSheet(arrowSpriteSheet, [1], 100);
const arrowLeftAnim = ex.Animation.fromSpriteSheet(arrowSpriteSheet, [2], 100);
const arrowRightAnim = ex.Animation.fromSpriteSheet(arrowSpriteSheet, [3], 100);

export class Arrow extends ex.Actor {
  public owner: Player | null;
  public msRemaining: number;
  public direction: string;
  public isUsed = false;

  constructor(owner: Player) {
    super({
      pos: new ex.Vector(owner.pos.x, owner.pos.y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
    });

    this.addTag(TAG_PLAYER_WEAPON);
    this.owner = owner;
    this.direction = this.owner.facing;
    // Expire after so much time
    this.msRemaining = 2000;
    this.setPosition();
  }

  setPosition() {
    // Travel in direction
    const ARROW_VELOCITY = 300;
    if (this.direction === DOWN) {
      this.graphics.use(arrowDownAnim);
      this.vel.y = ARROW_VELOCITY;
      this.pos.y += SCALE * 4;
    }
    if (this.direction === UP) {
      this.graphics.use(arrowUpAnim);
      this.vel.y = -ARROW_VELOCITY;
    }
    if (this.direction === LEFT) {
      this.graphics.use(arrowLeftAnim);
      this.vel.x = -ARROW_VELOCITY;
      this.pos.y += SCALE * 4;
    }
    if (this.direction === RIGHT) {
      this.graphics.use(arrowRightAnim);
      this.vel.x = ARROW_VELOCITY;
      this.pos.y += SCALE * 4;
    }
  }

  // Remove me if I hit something
  onDamagedSomething() {
    this.isUsed = true;
    this.kill();
  }

  onPreUpdate(_engine: ex.Engine, _delta: number) {
    // Remove after time has passed.
    // Fun note: originally tried this when the arrow goes "off screen", but it's not necessarily off-screen for other players
    this.msRemaining -= _delta;
    if (this.msRemaining <= 0) {
      this.kill();
    }
  }
}

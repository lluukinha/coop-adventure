import * as ex from 'excalibur';
import { Images, Sounds } from '../../resources';
import {
  DOWN,
  LEFT,
  RIGHT,
  SCALE,
  SCALE_4x,
  TAG_PLAYER_WEAPON,
  UP,
} from '../../constants';
import { IAnimationPayload } from '../../character-animations';
import { Player } from '../players/Player';

const swordSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.swordSheetImage,
  grid: {
    columns: 3,
    rows: 4,
    spriteWidth: 32,
    spriteHeight: 32,
  },
});

export const SWORD_SWING_1 = 'SWORD_SWING_1';
export const SWORD_SWING_2 = 'SWORD_SWING_2';
export const SWORD_SWING_3 = 'SWORD_SWING_3';

const swordFrames = {
  [DOWN]: {
    [SWORD_SWING_1]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [0], 100),
    [SWORD_SWING_2]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [1], 100),
    [SWORD_SWING_3]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [2], 100),
  },
  [UP]: {
    [SWORD_SWING_1]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [3], 100),
    [SWORD_SWING_2]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [4], 100),
    [SWORD_SWING_3]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [5], 100),
  },
  [LEFT]: {
    [SWORD_SWING_1]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [6], 100),
    [SWORD_SWING_2]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [7], 100),
    [SWORD_SWING_3]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [8], 100),
  },
  [RIGHT]: {
    [SWORD_SWING_1]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [9], 100),
    [SWORD_SWING_2]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [10], 100),
    [SWORD_SWING_3]: ex.Animation.fromSpriteSheet(swordSpriteSheet, [11], 100),
  },
};

export class Sword extends ex.Actor {
  public direction: string;
  public isUsed: boolean;
  public owner: ex.Actor | null;
  public frames: IAnimationPayload;

  constructor(owner: Player) {
    super({
      pos: new ex.Vector(owner.pos.x, owner.pos.y),
      width: 32,
      height: 32,
      scale: SCALE_4x,
      collider: ex.Shape.Box(32, 32, ex.Vector.Zero, new ex.Vector(-8, -8)),
      collisionType: ex.CollisionType.Passive,
      z: 99
    });

    this.direction = owner.facing;
    this.isUsed = false;
    this.owner = owner;
    this.addTag(TAG_PLAYER_WEAPON);

    Sounds.attackSound.play();

    this.frames = swordFrames;
    this.graphics.use(this.frames[this.direction][SWORD_SWING_1]);
    this.setPosition();
  }

  setPosition() {
    if (this.direction === DOWN) {
      this.pos.x -= 5 * SCALE;
      this.pos.y += 20 * SCALE;
    } else if (this.direction === UP) {
      this.pos.x += 5 * SCALE;
      this.pos.y -= 10 * SCALE;
    } else if (this.direction === LEFT) {
      this.pos.x -= 15 * SCALE;
      this.pos.y += SCALE;
    } else if (this.direction === RIGHT) {
      this.pos.x += 15 * SCALE;
      this.pos.y += SCALE;
    }
  }

  onDamagedSomething() {
    this.isUsed = true;
  }

  useFrame(key: string, direction: string) {
    this.graphics.use(this.frames[direction][key]);
  }
}

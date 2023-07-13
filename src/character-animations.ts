import * as ex from "excalibur";
import { Images } from "./resources";
import {
  ARROW1,
  ARROW2,
  DOWN,
  LEFT,
  PAIN,
  RIGHT,
  SWORD1,
  SWORD2,
  UP,
  WALK,
} from "./constants";

export interface IAnimationConfig {
  [key: string]: { [key: string]: { frames: number[]; speed: number } };
}

export interface IAnimationPayload {
  [key: string]: { [key: string]: ex.Animation };
}

export interface IFrameAnimation {
  frame: ex.Animation;
  duration: number;
  actorObjCallback: CallableFunction;
}

export interface IPainState {
  msLeft: number;
  painVelX: number;
  painVelY: number;
}

const WALK_ANIM_SPEED = 50;
const charSpritesheetGridConfig = {
  columns: 10,
  rows: 10,
  spriteWidth: 32,
  spriteHeight: 32,
};

const redSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.redSheetImage,
  grid: charSpritesheetGridConfig,
});

const blueSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.blueSheetImage,
  grid: charSpritesheetGridConfig,
});

const graySpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.graySheetImage,
  grid: charSpritesheetGridConfig,
});

const yellowSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.yellowSheetImage,
  grid: charSpritesheetGridConfig,
});

const heroSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.heroSheetImage,
  grid: {
    columns: 13,
    rows: 21,
    spriteWidth: 64,
    spriteHeight: 64,
  },
});

const SPRITESHEET_MAP: { [key: string]: ex.SpriteSheet } = {
  RED: redSpriteSheet,
  BLUE: blueSpriteSheet,
  GRAY: graySpriteSheet,
  YELLOW: yellowSpriteSheet,
  HERO: heroSpriteSheet,
};

const HERO_ANIMATION_CONFIGS: IAnimationConfig = {
  [DOWN]: {
    WALK: {
      frames: [130, 131, 132, 133, 134, 135, 136, 137, 138],
      speed: WALK_ANIM_SPEED,
    },
    // WALK: { frames: [246], speed: WALK_ANIM_SPEED },
    SWORD1: { frames: [184], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [187], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [239], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [244], speed: WALK_ANIM_SPEED },
    SHOOT: {
      frames: [234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246],
      speed: WALK_ANIM_SPEED,
    },
    PAIN: { frames: [130], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [26, 27, 28, 29, 30, 31, 32], speed: WALK_ANIM_SPEED },
  },
  [UP]: {
    WALK: {
      frames: [104, 105, 106, 107, 108, 109, 110, 111, 112],
      speed: WALK_ANIM_SPEED,
    },
    SWORD1: { frames: [161], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [158], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [212], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [216], speed: WALK_ANIM_SPEED },
    SHOOT: {
      frames: [208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
      speed: WALK_ANIM_SPEED,
    },
    PAIN: { frames: [104], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [0, 1, 2, 3, 4, 5, 6], speed: WALK_ANIM_SPEED },
  },
  [LEFT]: {
    WALK: {
      frames: [117, 118, 119, 120, 121, 122, 123, 124, 125],
      speed: WALK_ANIM_SPEED,
    },
    SWORD1: { frames: [173], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [172], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [226], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [229], speed: WALK_ANIM_SPEED },
    SHOOT: {
      frames: [221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233],
      speed: WALK_ANIM_SPEED,
    },
    PAIN: { frames: [117], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [13, 14, 15, 16, 17, 18, 19], speed: WALK_ANIM_SPEED },
  },
  [RIGHT]: {
    WALK: {
      frames: [143, 144, 145, 146, 147, 148, 149, 150, 151],
      speed: WALK_ANIM_SPEED,
    },
    SWORD1: { frames: [199], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [197], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [252], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [255], speed: WALK_ANIM_SPEED },
    SHOOT: {
      frames: [247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259],
      speed: WALK_ANIM_SPEED,
    },
    PAIN: { frames: [143], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [39, 40, 41, 42, 43, 44, 45], speed: WALK_ANIM_SPEED },
  },
};

const ANIMATION_CONFIGS: IAnimationConfig = {
  [DOWN]: {
    WALK: { frames: [0, 1], speed: WALK_ANIM_SPEED },
    SWORD1: { frames: [2], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [3], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [2], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [3], speed: WALK_ANIM_SPEED },
    SHOOT: { frames: [4], speed: WALK_ANIM_SPEED },
    PAIN: { frames: [4], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [], speed: WALK_ANIM_SPEED },
  },
  [UP]: {
    WALK: { frames: [10, 11], speed: WALK_ANIM_SPEED },
    SWORD1: { frames: [12], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [13], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [2], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [3], speed: WALK_ANIM_SPEED },
    SHOOT: { frames: [14], speed: WALK_ANIM_SPEED },
    PAIN: { frames: [4], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [], speed: WALK_ANIM_SPEED },
  },
  [LEFT]: {
    WALK: { frames: [20, 21], speed: WALK_ANIM_SPEED },
    SWORD1: { frames: [22], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [23], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [2], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [3], speed: WALK_ANIM_SPEED },
    SHOOT: { frames: [24], speed: WALK_ANIM_SPEED },
    PAIN: { frames: [4], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [], speed: WALK_ANIM_SPEED },
  },
  [RIGHT]: {
    WALK: { frames: [30, 31], speed: WALK_ANIM_SPEED },
    SWORD1: { frames: [32], speed: WALK_ANIM_SPEED },
    SWORD2: { frames: [33], speed: WALK_ANIM_SPEED },
    ARROW1: { frames: [2], speed: WALK_ANIM_SPEED },
    ARROW2: { frames: [3], speed: WALK_ANIM_SPEED },
    SHOOT: { frames: [34], speed: WALK_ANIM_SPEED },
    PAIN: { frames: [4], speed: WALK_ANIM_SPEED },
    PRAY: { frames: [], speed: WALK_ANIM_SPEED },
  },
};

export const generateCharacterAnimations = (spriteSheetKey: string) => {
  const sheet = SPRITESHEET_MAP[spriteSheetKey];
  const payload: IAnimationPayload = {};
  [UP, DOWN, LEFT, RIGHT].forEach((direction: string) => {
    payload[direction] = {};
    [WALK, SWORD1, SWORD2, ARROW1, ARROW2, "SHOOT", "PRAY", PAIN].forEach(
      (pose: string) => {
        const config =
          spriteSheetKey === "HERO"
            ? HERO_ANIMATION_CONFIGS
            : ANIMATION_CONFIGS;
        const { frames, speed } = config[direction][pose];
        payload[direction][pose] = ex.Animation.fromSpriteSheet(
          sheet,
          [...frames],
          speed
        );
      }
    );
  });
  return payload;
};

const monsterSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.monsterSheetImage,
  grid: {
    columns: 4,
    rows: 4,
    spriteWidth: 16,
    spriteHeight: 16,
  },
});

const MONSTER_ANIMATION_SPEED = 300;

export const generateMonsterAnimations = (): IAnimationPayload => {
  return {
    [WALK]: {
      [DOWN]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [0, 1],
        MONSTER_ANIMATION_SPEED
      ),
      [UP]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [4, 5],
        MONSTER_ANIMATION_SPEED
      ),
      [LEFT]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [8, 9],
        MONSTER_ANIMATION_SPEED
      ),
      [RIGHT]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [12, 13],
        MONSTER_ANIMATION_SPEED
      ),
    },
    [PAIN]: {
      [DOWN]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [2, 3],
        MONSTER_ANIMATION_SPEED
      ),
      [UP]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [6, 7],
        MONSTER_ANIMATION_SPEED
      ),
      [LEFT]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [10, 11],
        MONSTER_ANIMATION_SPEED
      ),
      [RIGHT]: ex.Animation.fromSpriteSheet(
        monsterSpriteSheet,
        [14, 15],
        MONSTER_ANIMATION_SPEED
      ),
    },
  };
};

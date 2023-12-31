import * as ex from 'excalibur';
import {
  ANCHOR_TOP_LEFT,
  SCALE,
  SCALE_2x,
  // TAG_PLAYER_WEAPON,
  TAG_WALL,
} from '../constants';
// import { Arrow } from './weapons/Arrow';
// import { Sword } from './weapons/Sword';

export class Floor extends ex.Actor {
  constructor(x: number, y: number, cols: number, rows: number) {
    // const SIZE = 16;

    super({
      width: cols,
      height: rows,
      pos: new ex.Vector(x * SCALE, y * SCALE),
      scale: SCALE_2x,
      anchor: ANCHOR_TOP_LEFT,
      collider: ex.Shape.Box(cols, rows, ex.Vector.Zero),
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Red,
    });

    this.graphics.opacity = 0.0;
    this.addTag(TAG_WALL);
  }
}

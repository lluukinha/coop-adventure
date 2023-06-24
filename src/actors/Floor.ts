import * as ex from 'excalibur';
import {
  ANCHOR_TOP_LEFT,
  SCALE,
  SCALE_2x,
  TAG_PLAYER_WEAPON,
} from '../constants';
import { Arrow } from './weapons/Arrow';
import { Sword } from './weapons/Sword';

export class Floor extends ex.Actor {
  constructor(x: number, y: number, cols: number, rows: number) {
    const SIZE = 16;

    super({
      width: SIZE * cols,
      height: SIZE * rows,
      pos: new ex.Vector(x * SIZE * SCALE, y * SIZE * SCALE),
      scale: SCALE_2x,
      anchor: ANCHOR_TOP_LEFT,
      collider: ex.Shape.Box(SIZE * cols, SIZE * rows, ex.Vector.Zero),
      collisionType: ex.CollisionType.Fixed,
      color: ex.Color.Red,
    });

    this.graphics.opacity = 0.0;
    this.on('collisionstart', (event) => this.onCollisionStart(event));
  }

  onCollisionStart(event: ex.CollisionStartEvent<ex.Actor>) {
    // Take damage from other players weapons
    if (event.other.hasTag(TAG_PLAYER_WEAPON)) {
      const weapon = event.other as Sword | Arrow;
      weapon.onDamagedSomething();
      return;
    }
  }
}

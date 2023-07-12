import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';

export class Player_CameraStrategy {
  public target: Player;
  public map: TiledMapResource;
  public position: ex.Vector;

  constructor(target: Player, map: TiledMapResource) {
    this.target = target;
    this.map = map;
    this.position = new ex.Vector(this.target.pos.x, this.target.pos.y);
  }

  action() {
    const SPEED = 0.08;
    const distance = this.position.distance(this.target.pos);

    if (distance > 2) {
      this.position.x = this.lerp(this.position.x, this.target.pos.x, SPEED);
      this.position.y = this.lerp(this.position.y, this.target.pos.y, SPEED);
    }

    // Limits
    const { tileWidth, tileHeight, width, height } = this.map.data;
    const R_LIMIT = tileWidth * width / 1.42;
    this.position.x = this.position.x > R_LIMIT ? R_LIMIT : this.position.x;

    const L_LIMIT = 16 * 16 * 1.15;
    this.position.x = this.position.x < L_LIMIT ? L_LIMIT : this.position.x;

    const D_LIMIT = tileHeight * height / 1.42;
    this.position.y = this.position.y > D_LIMIT ? D_LIMIT : this.position.y;

    const U_LIMIT = 16 * 16 / 1.3;
    this.position.y = this.position.y < U_LIMIT ? U_LIMIT : this.position.y;

    return this.position;
  }

  lerp(currentValue: number, destinationValue: number, time: number): number {
    return currentValue * (1 - time) + destinationValue * time;
  }
}

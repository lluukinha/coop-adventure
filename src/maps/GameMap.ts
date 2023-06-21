import * as ex from "excalibur";
import { ANCHOR_TOP_LEFT, SCALE_2x } from "../constants";
import { Floor } from "../actors/Floor";

export interface IMapCoordinates {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class GameMap extends ex.Actor {
    public tileWidth: number;
    public tileHeight: number;
    private coordinates: IMapCoordinates[];

    constructor(sprite: ex.Sprite, coordinates: IMapCoordinates[]) {
        super({ x: 0, y: 0, scale: SCALE_2x, anchor: ANCHOR_TOP_LEFT });
        this.graphics.use(sprite);
        this.tileWidth = 19;
        this.tileHeight = 22;
        this.coordinates = coordinates;
    }

    onInitialize(_engine: ex.Engine): void {
        this.coordinates.forEach(({ x, y, w, h }) => {
            const floor = new Floor(x, y, w, h);
            _engine.add(floor);
          });
    }
}
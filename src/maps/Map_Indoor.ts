import { Images } from "../resources";
import { GameMap, IMapCoordinates } from "./GameMap";

const mapSprite = Images.indoorImage.toSprite();
const coordinates: IMapCoordinates[] = [
    // Top wall, top right area
    { x: 2, y: 2, w: 13, h: 1 },
    { x: 14, y: 3, w: 3, h: 1 },
    { x: 16, y: 4, w: 2, h: 1 },
    // Right wall
    { x: 17, y: 5, w: 1, h: 8 },
    { x: 15, y: 12, w: 2, h: 8 },
    { x: 2, y: 3, w: 1, h: 9 },
    { x: 3, y: 11, w: 2, h: 9 },
    // Bottom
    { x: 4, y: 20, w: 12, h: 1 },
    // Inner
    { x: 7, y: 12, w: 5, h: 5 },
  ]

export const MAP_INDOOR = new GameMap(mapSprite, coordinates);

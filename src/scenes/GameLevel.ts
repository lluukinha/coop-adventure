import { TiledMapResource, TiledObject } from '@excaliburjs/plugin-tiled';
import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { Player_CameraStrategy } from '../classes/Player_CameraStrategy';
import { Floor } from '../actors/Floor';
import { Monster } from '../actors/monsters/Monster';
import { Teleport } from '../actors/objects/Teleport';

export default class GameLevel extends ex.Scene {
  public map: TiledMapResource;
  constructor(map: TiledMapResource) {
    super();
    this.map = map;
  }

  onInitialize(_engine: ex.Engine): void {
    this.map.addTiledMapToScene(this);
    const layers = this.map.data.getExcaliburObjects();
    const objects = layers.flatMap((layer) => layer.objects);
    this.buildObjectsOnScene(_engine, objects);
  }

  buildObjectsOnScene(_engine: ex.Engine, objects: TiledObject[]) {
    // Set up ability to query for certain actors on the fly
    let playerIncluded = false;
    for (let index = 0; index < objects.length; index++) {
      const object = objects[index] as TiledObject;

      if (object.type === 'Player' && !playerIncluded) {
        const player = new Player(object.x, object.y, 'RED');
        _engine.add(player);
        const cameraStrategy = new Player_CameraStrategy(player, this.map);
        _engine.currentScene.camera.addStrategy(cameraStrategy);
        _engine.currentScene.camera.zoom = 4;
        playerIncluded = true;
      }

      if (object.type === 'BoxCollider') {
        const collider = new Floor(
          object.x,
          object.y,
          object.width!,
          object.height!
        );
        _engine.add(collider);
      }

      if (object.type === 'Monster') {
        const monster = new Monster(object.x, object.y);
        _engine.add(monster);
      }

      if (object.type === 'Teleport') {
        const teleport = new Teleport(object.x, object.y);
        _engine.add(teleport);
      }
    }
  }
}

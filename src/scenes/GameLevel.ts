import { TiledMapResource, TiledObject } from '@excaliburjs/plugin-tiled';
import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { Player_CameraStrategy } from '../classes/Player_CameraStrategy';
import { Floor } from '../actors/Floor';
import { Monster } from '../actors/monsters/Monster';
import { Teleport } from '../actors/objects/Teleport';
import { TAG_ANY_PLAYER } from '../constants';
import { PlayerPortal } from '../actors/objects/PlayerPortal';

export default class GameLevel extends ex.Scene {
  public map: TiledMapResource;
  public playerPosition: TiledObject | null = null;
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
    for (let index = 0; index < objects.length; index++) {
      const object = objects[index] as TiledObject;

      if (object.type === 'Player') {
        const portal = new PlayerPortal(object.x, object.y);
        _engine.add(portal);
        const player = this.actors.find(a => a.hasTag(TAG_ANY_PLAYER)) as Player;
        player.pos.x = object.x;
        player.pos.y = object.y;
        const cameraStrategy = new Player_CameraStrategy(player, this.map);
        this.engine.currentScene.camera.addStrategy(cameraStrategy);
        this.engine.currentScene.camera.zoom = 3;
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
        const direction: string = object.properties.find(p => p.name === 'direction')!.value as string;
        const teleport = new Teleport(object.x, object.y, direction);
        _engine.add(teleport);
      }
    }
  }
}

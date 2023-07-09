import * as ex from 'excalibur';
import {
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  SCALE,
  TAG_ANY_PLAYER,
} from './constants';
import { Player } from './actors/players/Player';
import { loader, Maps } from './resources';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import { Floor } from './actors/Floor';
import { Player_CameraStrategy } from './classes/Player_CameraStrategy';
import { Monster } from './actors/monsters/Monster';
import '../src/style.css';
const game = new ex.Engine({
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  displayMode: ex.DisplayMode.FillScreen,
  fixedUpdateFps: 60,
  antialiasing: false, // PIXEL ART
});

const tiledMap = Maps.tiledMap as TiledMapResource;

game.on('initialize', () => {
  tiledMap.addTiledMapToScene(game.currentScene);

  const layers = tiledMap.data.getExcaliburObjects();

  // Set up ability to query for certain actors on the fly
  game.currentScene.world.queryManager.createQuery([TAG_ANY_PLAYER]);

  let playerIncluded = false;

  layers.forEach((layer) => {
    layer.objects.forEach((object) => {
      if (object.type === 'Player' && !playerIncluded) {
        const player = new Player(object.x, object.y, 'RED');
        game.add(player);
        const cameraStrategy = new Player_CameraStrategy(player, tiledMap);
        game.currentScene.camera.addStrategy(cameraStrategy);
        game.currentScene.camera.zoom = 4;
        playerIncluded = true;
      }

      if (object.type === 'BoxCollider') {
        const collider = new Floor(
          object.x,
          object.y,
          object.width!,
          object.height!
        );
        game.add(collider);
      }

      if (object.type === 'Monster') {
        const monster = new Monster(object.x, object.y);
        game.add(monster);
      }
    });
  });
});

game.start(loader);

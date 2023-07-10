import * as ex from 'excalibur';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE } from './constants';

import { loader, Maps } from './resources';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import '../src/style.css';
import GameLevel from './scenes/GameLevel';
const game = new ex.Engine({
  canvasElementId: 'game',
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  displayMode: ex.DisplayMode.FitScreen,
  fixedUpdateFps: 60,
  antialiasing: false, // PIXEL ART
});

game.add('level1', new GameLevel(Maps.tiledMap as TiledMapResource));
game.add('level2', new GameLevel(Maps.tiledMap2 as TiledMapResource));

game.on('levelup', () => {
  game.goToScene('level2');
});

game.start(loader).then(() => {
  game.goToScene('level1');
});

// pause when window is not focused
window.addEventListener('blur', () => {
  game.stop();
});

window.addEventListener('focus', () => {
  game.start();
});

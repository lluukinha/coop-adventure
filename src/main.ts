import * as ex from 'excalibur';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE } from './constants';

import { loader, Maps } from './resources';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import '../src/style.css';
import GameLevel from './scenes/GameLevel';
import { Player } from './actors/players/Player';
import { PowerUp } from './classes/PowerUp';
const game = new ex.Engine({
  canvasElementId: 'game',
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  displayMode: ex.DisplayMode.FillScreen,
  fixedUpdateFps: 60,
  antialiasing: false, // PIXEL ART
});

const player = new Player(0, 0, 'RED');
game.add(player);

const powerUpScreen = new PowerUp(game, player);

game.on("showPowerUp", () => {
  powerUpScreen.show();
})

const level1 = new GameLevel(Maps.tiledMap as TiledMapResource);
game.add('level1', level1);
const level2 = new GameLevel(Maps.tiledMap2 as TiledMapResource);
game.add('level2', level2);

game.on('levelup', () => {
  level1.remove(player);
  level2.add(player);
  game.goToScene('level2');
});

game.start(loader).then(() => {
  level1.add(player);
  game.goToScene('level1');
});

// pause when window is not focused
window.addEventListener('blur', () => {
  game.stop();
});

window.addEventListener('focus', () => {
  if (!powerUpScreen.active) game.start();
});

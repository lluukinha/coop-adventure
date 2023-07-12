import * as ex from 'excalibur';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE } from './constants';
import { loader, Maps } from './resources';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import '../src/style.css';
import GameLevel from './scenes/GameLevel';
import { Player } from './actors/players/Player';
import { PowerUp } from './classes/PowerUp';
import { MainMenu } from './scenes/MainMenu';

const game = new ex.Engine({
  canvasElementId: 'game',
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  displayMode: ex.DisplayMode.FillScreen,
  fixedUpdateFps: 60,
  antialiasing: false, // PIXEL ART
});

const player = new Player(0, 0, 'HERO');
game.add(player);

const powerUpScreen = new PowerUp(game, player);

game.on('showPowerUp', () => {
  powerUpScreen.show();
});

const mainMenu = new MainMenu(game);
game.add('menu', mainMenu);
const level1 = new GameLevel(Maps.tiledMap as TiledMapResource);
game.add('level1', level1);
const level2 = new GameLevel(Maps.tiledMap2 as TiledMapResource);
game.add('level2', level2);
const level3 = new GameLevel(Maps.tiledMap3 as TiledMapResource);
game.add('level3', level3);

game.on('levelup', (event: ex.GameEvent<string>) => {
  level1.remove(player);
  eval(event.target).add(player);
  game.goToScene(event.target);
});

game.add(player);
game.on('startGame', () => {
  mainMenu.remove(player);
  // level1.add(player);
  // game.goToScene('level1');
  level3.add(player);
  game.goToScene('level3');
});

mainMenu.add(player);
game.goToScene('menu');
game.start(loader);

// pause when window is not focused
window.addEventListener('blur', () => {
  game.stop();
});

window.addEventListener('focus', () => {
  if (!powerUpScreen.active) game.start();
});

import * as ex from 'excalibur';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE } from './constants';
import { loader, Maps } from './resources';
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import '../src/style.css';
import GameLevel from './scenes/GameLevel';
import { Player } from './actors/players/Player';
import { PowerUp } from './classes/PowerUp';
import { MainMenu } from './scenes/MainMenu';
import { PlayerGems } from './hud/PlayerGems';
import { PlayerGemsQuantity } from './hud/PlayerGemsQuantity';
// import { DevTool } from '@excaliburjs/dev-tools';

const game = new ex.Engine({
  canvasElementId: 'game',
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  displayMode: ex.DisplayMode.FitScreen,
  fixedUpdateFps: 60,
  antialiasing: false, // PIXEL ART
});

// const devtool = new DevTool(game);
// devtool.engine.debug.physics.showBroadphaseSpacePartitionDebug = true;

const player = new Player(0, 0, 'HERO');
game.add(player);

// HUD Elements
const playerGems = new PlayerGems();
const playerGemsQuantity = new PlayerGemsQuantity(player.gems);
game.add(playerGems);
game.add(playerGemsQuantity);

const powerUpScreen = new PowerUp(game, player);

game.on('showPowerUp', () => {
  player.pray(powerUpScreen);
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
  game.currentScene.remove(player);
  const objects = [player, playerGems, playerGemsQuantity];
  game.goToScene(event.target, objects);
});

game.add(player);
game.on('startGame', () => {
  mainMenu.remove(player);
  const objects = [player, playerGems, playerGemsQuantity];
  game.goToScene('level3', objects);
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

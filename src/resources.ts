import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import * as ex from 'excalibur';

const Images: { [key: string]: ex.ImageSource } = {
  // Characters
  redSheetImage: new ex.ImageSource('/sprites/character-red-sheet.png'),
  blueSheetImage: new ex.ImageSource('/sprites/character-blue-sheet.png'),
  graySheetImage: new ex.ImageSource('/sprites/character-gray-sheet.png'),
  yellowSheetImage: new ex.ImageSource('/sprites/character-yellow-sheet.png'),

  // Gems
  blueGemSheetImage: new ex.ImageSource('/sprites/blue-gem-sheet.png'),
  coinSheetImage: new ex.ImageSource('/sprites/coin.png'),
  greenPortalSheetImage: new ex.ImageSource('/sprites/green-portal-sheet.png'),
  purplePortalSheetImage: new ex.ImageSource(
    '/sprites/purple-portal-sheet.png'
  ),

  // Monsters
  monsterSheetImage: new ex.ImageSource('/sprites/monster-sheet.png'),

  // Weapons
  swordSheetImage: new ex.ImageSource('/sprites/sword-sheet.png'),
  arrowSheetImage: new ex.ImageSource('/sprites/arrow-sheet.png'),

  // Effects
  explosionSheetImage: new ex.ImageSource('/sprites/explosion-sheet.png'),
};

const Sounds: { [key: string]: ex.Sound } = {
  coinSound: new ex.Sound('/sounds/gem.wav'),
  attackSound: new ex.Sound('/sounds/attack.wav'),
  teleportSound: new ex.Sound('/sounds/teleport.wav'),
  enemyDownSound: new ex.Sound('/sounds/enemyDown.wav'),
};

const Maps: { [key: string]: TiledMapResource } = {
  tiledMap: new TiledMapResource('/maps/map.tmx'),
  tiledMap2: new TiledMapResource('/maps/map2.tmx'),
};

const loader = new ex.Loader();
loader.suppressPlayButton = true;
const allResources = { ...Images, ...Maps, ...Sounds };

for (const res in allResources) {
  loader.addResource(allResources[res]);
}

export { loader, Images, Maps, Sounds };

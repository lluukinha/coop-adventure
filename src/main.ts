// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `

import * as ex from "excalibur";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, SCALE, EVENT_SEND_PLAYER_UPDATE, TAG_ANY_PLAYER, EVENT_SEND_MONSTER_UPDATE, EVENT_INITIAL_DATA_REQUESTED } from "./constants";
import { Player } from "./actors/players/Player";
// import { Floor } from "./actors/players/Floor";
import { loader } from "./resources";
import { MAP_INDOOR } from "./maps/Map_Indoor";
import { Player_CameraStrategy } from "./classes/Player_CameraStrategy";
import { NetworkClient } from "./classes/NetworkClient";
import { NetworkActorsMap } from "./classes/NetworkActorsMap";

const game = new ex.Engine({
  width: VIEWPORT_WIDTH * SCALE,
  height: VIEWPORT_HEIGHT * SCALE,
  fixedUpdateFps: 60,
  antialiasing: false // PIXEL ART
});

// const floor = new Floor(1, 1, 1, 6);
// game.add(floor);

game.add(MAP_INDOOR);

const player = new Player(200,200, "RED");
game.add(player);

game.on("initialize", () => {
  // Add custom camera behavior, following player and being limited to the map bounds
  const cameraStrategy = new Player_CameraStrategy(player, MAP_INDOOR);
  game.currentScene.camera.addStrategy(cameraStrategy);

  // Set up ability to query for certain actors on the fly
  game.currentScene.world.queryManager.createQuery([TAG_ANY_PLAYER]);

  // Create player state list and network listener
  new NetworkActorsMap(game);
  const peer = new NetworkClient(game);
  game.on(EVENT_SEND_PLAYER_UPDATE, (update) => {
    peer.sendUpdate(update as unknown as string);
  });

  game.on(EVENT_INITIAL_DATA_REQUESTED, () => {
    peer.sendUpdate(player.createNetworkUpdateString());
  });

  game.on(EVENT_SEND_MONSTER_UPDATE, (update) => {
    peer.sendUpdate(update as unknown as string);
  });
})

game.start(loader);

// const createAddMonsterButton = () => {
//   const button = document.createElement("button");
//   button.style.display = "block";
//   button.innerText = "ADD MONSTER";
//   button.onclick = () => {
//     const monster = new Monster(100 ,100);
//     game.add(monster);
//   }

//   document.body.append(button);
// }

// createAddMonsterButton();
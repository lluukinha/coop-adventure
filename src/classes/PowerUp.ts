import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { TAG_ANY_PLAYER } from '../constants';

export class PowerUp {
  player: Player;
  constructor(_engine: ex.Engine) {
    const playersQuery = _engine.currentScene.world.queryManager.getQuery([
      TAG_ANY_PLAYER,
    ]);
    const nearbyPlayers = playersQuery.getEntities();
    this.player = nearbyPlayers[0]! as Player;

    _engine.stop();

    const element = document.createElement('div');
    element.classList.add('power-up-screen');

    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.innerText = 'Auto Attack';

    element.append(powerUp);
    document.body.prepend(element);

    powerUp.addEventListener('click', () => {
      this.player.autoAttack = true;
      _engine.start();
    });
  }
}

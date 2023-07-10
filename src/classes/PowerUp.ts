import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { TAG_ANY_PLAYER } from '../constants';

export class PowerUp {
  player: Player;
  engine: ex.Engine;
  powerUpScreen: HTMLDivElement;
  constructor(_engine: ex.Engine) {
    this.engine = _engine;

    this.player = _engine.currentScene.actors.find((a) =>
      a.hasTag(TAG_ANY_PLAYER)
    ) as Player;
    this.powerUpScreen = document.createElement('div');
    this.powerUpScreen.classList.add('power-up-screen');

    this.engine.stop();

    this.drawPowerUpScreen();
  }

  drawPowerUpScreen() {
    this.powerUpScreen.append(this.createAutoAttack());
    this.powerUpScreen.append(this.createIncreaseSpeed());
    document.body.prepend(this.powerUpScreen);
  }

  closePowerUpScreen() {
    document.querySelector('.power-up-screen')?.remove();
    this.engine.start();
  }

  createIncreaseSpeed() {
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.innerText = 'Increase Attack Speed';

    powerUp.addEventListener('click', () => {
      this.player.attackSpeed -= 50;
      this.closePowerUpScreen();
    });

    return powerUp;
  }

  createAutoAttack() {
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');
    powerUp.innerText = 'Auto Attack';

    powerUp.addEventListener('click', () => {
      this.player.autoAttack = true;
      this.closePowerUpScreen();
    });

    return powerUp;
  }
}

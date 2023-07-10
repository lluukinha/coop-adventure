import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { powerUps } from '../powerUps/powerUps';

export class PowerUp {
  player: Player;
  engine: ex.Engine;
  powerUpScreen: HTMLDivElement | undefined;
  active: boolean = false;
  keyPressBinder = (key: KeyboardEvent) => {
    if (!this.active) return;
    const selectedElement = this.powerUpScreen!.querySelector(
      '.selected'
    ) as HTMLDivElement;
    if (key.code === 'Enter' || key.code === 'Space') {
      selectedElement.click();
    } else {
      const powerUps = [...this.powerUpScreen!.querySelectorAll('.power-up')];
      const descriptionElement = this.powerUpScreen!.querySelector(
        '.power-up-description'
      ) as HTMLDivElement;
      const selectedIndex = powerUps.findIndex((p) =>
        p.classList.contains('selected')
      );
      if (key.code === 'ArrowRight' || key.code === 'KeyD') {
        const newIndex =
          selectedIndex === powerUps.length - 1 ? 0 : selectedIndex + 1;
        const newSelectedItem = powerUps[newIndex] as HTMLDivElement;
        selectedElement.classList.remove('selected');
        newSelectedItem.classList.add('selected');
        descriptionElement.innerText = newSelectedItem.dataset
          .description as string;
      }

      if (key.code === 'ArrowLeft' || key.code === 'KeyA') {
        const newIndex =
          selectedIndex === 0 ? powerUps.length - 1 : selectedIndex - 1;
        const newSelectedItem = powerUps[newIndex] as HTMLDivElement;
        selectedElement.classList.remove('selected');
        newSelectedItem.classList.add('selected');
        descriptionElement.innerText = newSelectedItem.dataset
          .description as string;
      }
    }
  };

  constructor(_engine: ex.Engine, player: Player) {
    this.engine = _engine;
    this.player = player;
    document.addEventListener('keyup', this.keyPressBinder);
  }

  show() {
    this.active = true;
    this.powerUpScreen = document.createElement('div');
    this.powerUpScreen.classList.add('power-up-screen');
    this.engine.stop();
    this.drawPowerUpScreen();
  }

  hide() {
    document.querySelector('.power-up-screen')?.remove();
    this.engine.start();
    this.active = false;
  }

  drawPowerUpScreen() {
    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('power-up-description');
    for (let i: number = 0; i < powerUps.length; i++) {
      const powerUp = powerUps[i];
      const powerUpElement = document.createElement('div');
      powerUpElement.classList.add('power-up');
      if (i === 0) {
        powerUpElement.classList.add('selected');
        descriptionElement.innerText = powerUp.description;
      }

      powerUpElement.innerText = powerUp.name;
      powerUpElement.dataset.description = powerUp.description;
      powerUpElement.addEventListener('click', () => {
        powerUp.method(this.player);
        this.player.powerUps[powerUp.type] = !!this.player.powerUps[
          powerUp.type
        ]
          ? this.player.powerUps[powerUp.type] + 1
          : 1;
        this.hide();
      });
      this.powerUpScreen!.append(powerUpElement);
    }
    this.powerUpScreen!.append(descriptionElement);

    document.body.prepend(this.powerUpScreen!);
  }

  closePowerUpScreen() {}
}

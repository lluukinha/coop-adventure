import * as ex from 'excalibur';
import { Player } from '../actors/players/Player';
import { TAG_ANY_PLAYER } from '../constants';

export class PowerUp extends ex.ScreenElement {
  constructor() {
    super({
      width: 150,
      height: 150,
      color: ex.Color.Blue,
    });
  }

  onInitialize(_engine: ex.Engine): void {
    this.pos.x = _engine.canvas.width / 2 - this.width / 2;
    this.pos.y = _engine.canvas.height / 2 - this.height / 2;
    _engine.currentScene.actors.forEach((actor) => (actor.isPaused = true));
  }

  getPlayer(): Player {
    const playersQuery = this.scene.world.queryManager.getQuery([
      TAG_ANY_PLAYER,
    ]);
    // Filter down to nearby ones within pixel range
    const nearbyPlayers = playersQuery.getEntities();
    return nearbyPlayers[0]! as Player;
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    const actionKey = ex.Input.Keys.Enter;
    if (_engine.input.keyboard.wasPressed(actionKey)) {
      const player = this.getPlayer();
      player.autoAttack = true;

      _engine.currentScene.actors.forEach((actor) => (actor.isPaused = false));

      this.kill();
    }
  }
}

import { SpriteSequence } from '../../classes/SpriteSequence';
import { ARROWACTION, SWORD1, SWORD2, SWORDACTION } from '../../constants';
import { Arrow } from '../weapons/Arrow';
import {
  SWORD_SWING_1,
  SWORD_SWING_2,
  SWORD_SWING_3,
  Sword,
} from '../weapons/Sword';
import { Player } from './Player';

export class PlayerActions {
  public actor: Player;
  public engine: ex.Engine;

  constructor(actor: Player) {
    this.actor = actor;
    this.engine = actor.scene.engine;
  }

  actionSwingSword() {
    const SWORD_SWING_SPEED = 50;
    const { actor, engine } = this;

    // Create a new sequence with dedicated called per frame
    actor.actionAnimation = new SpriteSequence(
      SWORDACTION,
      [
        {
          frame: actor.skinAnimations[actor.facing][SWORD1],
          duration: SWORD_SWING_SPEED,
          actorObjCallback: (swordInstance: Sword) => {
            swordInstance.useFrame(SWORD_SWING_1, actor.facing);
          },
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: SWORD_SWING_SPEED,
          actorObjCallback: (swordInstance: Sword) => {
            swordInstance.useFrame(SWORD_SWING_2, actor.facing);
          },
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: SWORD_SWING_SPEED * 2,
          actorObjCallback: (swordInstance: Sword) => {
            swordInstance.useFrame(SWORD_SWING_3, actor.facing);
          },
        },
      ],
      (swordInstance: Sword) => {
        // When series is over, clear out the dedicated animation aand remove the Weapon
        actor.actionAnimation = null;

        // Remove the sword.
        swordInstance.kill();
      }
    );

    // Create the Sword here...
    const sword = new Sword(actor);
    engine.add(sword);

    // Assign this sword instance to be controllable by each frame above
    actor.actionAnimation.actorObject = sword;
  }

  actionShootArrow(attackSpeed: number) {
    // const SHOOT_ARROW_SPEED = 155;
    const { actor, engine } = this;

    // Create a new sequence for arrows
    actor.actionAnimation = new SpriteSequence(
      ARROWACTION,
      [
        {
          frame: actor.skinAnimations[actor.facing][SWORD1],
          duration: attackSpeed,
          actorObjCallback: () => {},
        },
        {
          // On this frame, create an Arrow in the samee facing direction as my actor
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: attackSpeed,
          actorObjCallback: () => {
            // Create an arrow projectile
            const arrow = new Arrow(actor);
            engine.add(arrow);
          },
        },
      ],
      () => {
        // Clear out dedicated animation when this series is complete
        actor.actionAnimation = null;
      }
    );
  }

  async flashSeries() {
    const { actor } = this;
    if (actor.isPainFlashing) return;

    actor.isPainFlashing = true;
    const PAIN_FLASH_SPEED = 100;

    for (let i = 0; i <= 4; i++) {
      actor.graphics.opacity = 0;
      await actor.actions.delay(PAIN_FLASH_SPEED).toPromise();
      actor.graphics.opacity = 1;
      await actor.actions.delay(PAIN_FLASH_SPEED).toPromise();
    }

    actor.isPainFlashing = false;
  }
}

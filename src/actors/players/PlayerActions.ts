import { IFrameAnimation } from '../../character-animations';
import { SpriteSequence } from '../../classes/SpriteSequence';
import {
  ARROWACTION,
  DASH,
  DASHACTION,
  DOWN,
  LEFT,
  RIGHT,
  SWORD1,
  SWORD2,
  SWORDACTION,
  UP,
} from '../../constants';
import { Arrow } from '../weapons/Arrow';
import {
  SWORD_SWING_1,
  SWORD_SWING_2,
  SWORD_SWING_3,
  Sword,
} from '../weapons/Sword';
import { Player } from './Player';
import { PowerUp } from '../../classes/PowerUp';

export class PlayerActions {
  public actor: Player;
  public engine: ex.Engine;

  constructor(actor: Player) {
    this.actor = actor;
    this.engine = actor.scene.engine;
  }

  dashActor(player: Player) {
    const positions = 20;
    if (player.facing === DOWN) {
      player.pos.y += positions;
    }
    if (player.facing === UP) {
      player.pos.y -= positions;
    }
    if (player.facing === RIGHT) {
      player.pos.x += positions;
    }
    if (player.facing === LEFT) {
      player.pos.x -= positions;
    }
  }

  async actionDash() {
    const { actor } = this;

    if (actor.vel.x + actor.vel.y === 0) return;

    actor.isPainFlashing = true;

    const dashFrames = actor.skinAnimations[actor.facing][DASH].frames.map(
      (frame) => ({
        frame: frame.graphic,
        duration: frame.duration,
        actorObjCallback: () => this.dashActor(actor),
      })
    ) as unknown as IFrameAnimation[];

    actor.actionAnimation = new SpriteSequence(DASHACTION, dashFrames, () => {
      // Clear out dedicated animation when this series is complete
      actor.actionAnimation = null;
      actor.isPainFlashing = false;
    });
  }

  actionSwingSword() {
    const { actor, engine } = this;

    // Create a new sequence with dedicated called per frame
    actor.actionAnimation = new SpriteSequence(
      SWORDACTION,
      [
        {
          frame: actor.skinAnimations[actor.facing][SWORD1],
          duration: actor.attackSpeed,
          actorObjCallback: (swordInstance: Sword) => {
            swordInstance.useFrame(SWORD_SWING_1, actor.facing);
          },
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: actor.attackSpeed,
          actorObjCallback: (swordInstance: Sword) => {
            swordInstance.useFrame(SWORD_SWING_2, actor.facing);
          },
        },
        {
          frame: actor.skinAnimations[actor.facing][SWORD2],
          duration: actor.attackSpeed * 2,
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

  actionPray(powerUpScreen: PowerUp) {
    const { actor } = this;

    const prayFrames = actor.skinAnimations[actor.facing].PRAY.frames.map(
      (frame, index) => {
        const finishPray = () => {
          powerUpScreen.show();
        };

        return {
          frame: frame.graphic,
          duration: 150,
          actorObjCallback: index === 6 ? finishPray : () => {},
        };
      }
    ) as unknown as IFrameAnimation[];

    actor.actionAnimation = new SpriteSequence(ARROWACTION, prayFrames, () => {
      // Clear out dedicated animation when this series is complete
      actor.actionAnimation = null;
    });
  }

  actionShootArrow(attackSpeed: number) {
    // const SHOOT_ARROW_SPEED = 155;
    const { actor, engine } = this;

    const arrowFrames = actor.skinAnimations[actor.facing].SHOOT.frames.map(
      (frame, index) => {
        const addArrow = () => {
          const arrow = new Arrow(actor);
          engine.add(arrow);
        };

        return {
          frame: frame.graphic,
          duration: attackSpeed,
          actorObjCallback: index === 9 ? addArrow : () => {},
        };
      }
    ) as unknown as IFrameAnimation[];

    actor.actionAnimation = new SpriteSequence(ARROWACTION, arrowFrames, () => {
      // Clear out dedicated animation when this series is complete
      actor.actionAnimation = null;
    });
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

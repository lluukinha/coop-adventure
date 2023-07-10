import * as ex from 'excalibur';
import {
  ANCHOR_CENTER,
  DOWN,
  LEFT,
  RIGHT,
  SCALE_2x,
  SWORDACTION,
  TAG_ANY_PLAYER,
  TAG_COIN,
  TAG_DAMAGES_PLAYER,
  TAG_MONSTER,
  UP,
  WALK,
} from '../../constants';
import {
  IAnimationPayload,
  IPainState,
  generateCharacterAnimations,
} from '../../character-animations';
import { PlayerAnimations } from './PlayerAnimations';
import { SpriteSequence } from '../../classes/SpriteSequence';
import { DirectionQueue } from '../../classes/DirectionQueue';
import { PlayerActions } from './PlayerActions';
import { Monster } from '../monsters/Monster';
import { Gem } from '../Gem';
import { PowerUp } from '../../classes/PowerUp';

const ACTION_1_KEY = ex.Input.Keys.Z;
const ACTION_2_KEY = ex.Input.Keys.X;

const PLAYERS = [
  { key: ex.Input.Keys.Digit1, skinId: 'RED' },
  { key: ex.Input.Keys.Digit2, skinId: 'BLUE' },
  { key: ex.Input.Keys.Digit3, skinId: 'GRAY' },
  { key: ex.Input.Keys.Digit4, skinId: 'YELLOW' },
];

export class Player extends ex.Actor {
  private directionQueue: DirectionQueue;
  public facing: string;
  public skinId: string;
  public skinAnimations: IAnimationPayload;
  public playerAnimations: PlayerAnimations | undefined;
  public playerActions: PlayerActions | undefined;
  public walkingMsLeft: number | undefined;
  public actionAnimation: SpriteSequence | null;
  public isPainFlashing: boolean;
  public painState: IPainState | null;
  public attackSpeed: number = 255;
  public autoAttack: boolean = false;
  public experience: number = 0;
  public canMove: boolean = true;

  constructor(x: number, y: number, skinId: string) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
      collider: ex.Shape.Box(15, 13, ANCHOR_CENTER, new ex.Vector(0, 6)),
      collisionType: ex.CollisionType.Active,
      color: ex.Color.Green,
      visible: false,
      z: 2
    });

    this.directionQueue = new DirectionQueue();
    this.facing = DOWN;
    this.actionAnimation = null;
    this.skinId = skinId;
    this.skinAnimations = generateCharacterAnimations(skinId);
    this.graphics.use(this.skinAnimations[this.facing][WALK]);
    this.isPainFlashing = false;
    this.painState = null;
    this.on('collisionstart', (event) => this.onCollisionStart(event));
  }

  pause() {
    this.canMove = false;
    this.vel.x = 0;
    this.vel.y = 0;
  }

  resume() {
    this.canMove = true;
  }

  onInitialize(_engine: ex.Engine): void {
    this.playerAnimations = new PlayerAnimations(this);
    this.playerActions = new PlayerActions(this);
    this.addTag(TAG_ANY_PLAYER);
  }

  onCollisionStart(event: ex.CollisionStartEvent<ex.Actor>) {
    // Take damage from external things (Enemies, etc)
    if (event.other.hasTag(TAG_DAMAGES_PLAYER)) {
      console.log('enemy collided');
      this.takeDamage((event.other as Monster).facing);
    }

    if (event.other.hasTag(TAG_COIN)) {
      const coin = event.other as Gem;
      coin.sound.play();
      this.experience += coin.experience;
      coin.kill();
      new PowerUp(this.scene.engine);
    }
  }

  calculateOppositeDirection(direction: string): string {
    if (direction === LEFT) return RIGHT;
    if (direction === RIGHT) return LEFT;
    if (direction === UP) return DOWN;
    if (direction === DOWN) return UP;
    return UP;
  }

  takeDamage(damageComingFromDirection: string | null = null) {
    // NO Pain if already in pain
    if (this.isPainFlashing) return;

    const facing = !!damageComingFromDirection
      ? this.calculateOppositeDirection(damageComingFromDirection)
      : this.facing;

    // Start a new pain moment
    // const PAIN_VELOCITY = !!damageComingFromDirection ? 150 : 150;
    const PAIN_VELOCITY = 150;
    this.painState = {
      msLeft: 150,
      painVelX: facing === LEFT ? PAIN_VELOCITY : -PAIN_VELOCITY,
      painVelY: facing === UP ? PAIN_VELOCITY : -PAIN_VELOCITY,
    };

    // Flash for a little bit
    this.playerActions?.flashSeries();
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    this.directionQueue.update(_engine);

    // Work on dedicated animation if we are doing one
    this.playerAnimations?.progressThroughActionAnimation(_delta);

    let movementUpdated = false;

    if (!this.actionAnimation || this.actionAnimation.type != SWORDACTION) {
      this.onPreUpdateMovement(_engine, _delta);
      movementUpdated = true;
    }

    if (!this.actionAnimation) {
      if (!movementUpdated) this.onPreUpdateMovement(_engine, _delta);
      this.onPreUpdateActionKeys(_engine);

      if (!!this.autoAttack) {
        const hasMonstersAlive = this.scene.actors.some((d) =>
          d.hasTag(TAG_MONSTER)
        );

        if (this.vel.x === 0 && this.vel.y === 0 && hasMonstersAlive) {
          this.playerActions?.actionShootArrow(this.attackSpeed);
        }
      }
    }

    // Show the right frames
    this.playerAnimations?.showRelevantAnimation();
  }

  onPreUpdateMovement(_engine: ex.Engine, _delta: number): void {
    if (!this.canMove) return;
    if (!!this.painState) {
      this.vel.x = this.painState.painVelX;
      this.vel.y = this.painState.painVelY;

      // Work on getting rid of pain
      this.painState.msLeft -= _delta;
      if (this.painState.msLeft <= 0) {
        this.painState = null;
      }
      return;
    }

    const keyboard = _engine.input.keyboard;
    const WALKING_SPEED = 100;

    this.vel.x = 0;
    this.vel.y = 0;
    if (keyboard.isHeld(ex.Input.Keys.Left)) {
      this.vel.x = -1;
    }
    if (keyboard.isHeld(ex.Input.Keys.Right)) {
      this.vel.x = 1;
    }
    if (keyboard.isHeld(ex.Input.Keys.Up)) {
      this.vel.y = -1;
    }
    if (keyboard.isHeld(ex.Input.Keys.Down)) {
      this.vel.y = 1;
    }

    // Normalize walking speed
    if (this.vel.x !== 0 || this.vel.y !== 0) {
      this.vel = this.vel.normalize();
      this.vel.x = this.vel.x * WALKING_SPEED;
      this.vel.y = this.vel.y * WALKING_SPEED;
    }

    this.facing = this.directionQueue.direction ?? this.facing;
  }

  onPreUpdateActionKeys(_engine: ex.Engine) {
    // Register action keys
    if (_engine.input.keyboard.wasPressed(ACTION_1_KEY)) {
      this.playerActions?.actionSwingSword();
      return;
    }

    if (_engine.input.keyboard.wasPressed(ACTION_2_KEY)) {
      this.playerActions?.actionShootArrow(this.attackSpeed);
      return;
    }

    for (let i: number = 0; i < PLAYERS.length; i++) {
      const { key, skinId } = PLAYERS[i];
      if (_engine.input.keyboard.wasPressed(key)) {
        this.skinId = skinId;
        this.skinAnimations = generateCharacterAnimations(this.skinId);
      }
    }
  }
}

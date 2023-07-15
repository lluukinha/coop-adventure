import * as ex from "excalibur";
import {
  DOWN,
  LEFT,
  RIGHT,
  SCALE_2x,
  TAG_ANY_PLAYER,
  TAG_PLAYER_HUD,
  UP,
  WALK,
} from "../../constants";
import {
  IAnimationPayload,
  IPainState,
  generateCharacterAnimations,
} from "../../character-animations";
import { PlayerAnimations } from "./PlayerAnimations";
import { SpriteSequence } from "../../classes/SpriteSequence";
import { DirectionQueue } from "../../classes/DirectionQueue";
import { PlayerActions } from "./PlayerActions";
import { PlayerPowerUps } from "../../powerUps/powerUps";
import { PlayerGems } from "../../hud/PlayerGems";
import { PlayerGemsQuantity } from "../../hud/PlayerGemsQuantity";

const ACTION_1_KEY = ex.Input.Keys.Z;
const ACTION_2_KEY = ex.Input.Keys.X;
const POWER_UP_KEY = ex.Input.Keys.P;
const DASH_KEY = ex.Input.Keys.C;

const PLAYERS = [
  { key: ex.Input.Keys.Digit1, skinId: "RED" },
  { key: ex.Input.Keys.Digit2, skinId: "BLUE" },
  { key: ex.Input.Keys.Digit3, skinId: "GRAY" },
  { key: ex.Input.Keys.Digit4, skinId: "YELLOW" },
  { key: ex.Input.Keys.Digit5, skinId: "HERO" },
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
  public experience: number = 0;
  public gems: number = 0;
  public canMove: boolean = true;
  public isShowingHud: boolean = false;
  public hasSlingShot: boolean = true;

  // power ups will manipulate this variables below
  public attackSpeed: number = 50;
  public autoAttack: boolean = false;
  public walkingSpeed: number = 100;
  public powerUps: PlayerPowerUps = {};

  constructor(x: number, y: number, skinId: string) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
      collider: ex.Shape.Box(
        20,
        15,
        new ex.Vector(0.5, 0),
        new ex.Vector(0, 15)
      ),
      collisionType: ex.CollisionType.Active,
      visible: false,
      z: 2,
    });

    this.directionQueue = new DirectionQueue();
    this.facing = DOWN;
    this.actionAnimation = null;
    this.skinId = skinId;
    this.skinAnimations = generateCharacterAnimations(skinId);
    this.graphics.use(this.skinAnimations[this.facing][WALK]);
    this.isPainFlashing = false;
    this.painState = null;
  }

  pray() {
    this.playerActions?.actionPray();
  }

  pause() {
    this.canMove = false;
    this.vel.x = 0;
    this.vel.y = 0;
  }

  resume() {
    this.canMove = true;
  }

  showDetailsOnScene() {
    this.scene.add(new PlayerGems());
    this.scene.add(new PlayerGemsQuantity(this.gems));
    this.isShowingHud = true;
  }

  removeDetailsFromScene() {
    const elements = this.scene.actors.filter((a) => a.hasTag(TAG_PLAYER_HUD));
    elements.forEach((el) => el.kill());
    this.isShowingHud = false;
  }

  onInitialize(_engine: ex.Engine): void {
    this.playerAnimations = new PlayerAnimations(this);
    this.playerActions = new PlayerActions(this);
    this.addTag(TAG_ANY_PLAYER);
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

  onPostUpdate(_engine: ex.Engine, _delta: number): void {
    if (!this.isShowingHud && this.graphics.visible) {
      this.showDetailsOnScene();
    }

    if (!!this.isShowingHud && !this.graphics.visible) {
      this.removeDetailsFromScene();
    }

    this.directionQueue.update(_engine);

    // Work on dedicated animation if we are doing one
    this.playerAnimations?.progressThroughActionAnimation(_delta);

    if (!this.actionAnimation) {
      this.onPreUpdateMovement(_engine, _delta);
      this.onPreUpdateActionKeys(_engine);
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
      this.vel.x = this.vel.x * this.walkingSpeed;
      this.vel.y = this.vel.y * this.walkingSpeed;
    }

    this.facing = this.directionQueue.direction ?? this.facing;
  }

  onPreUpdateActionKeys(_engine: ex.Engine) {
    // Register action keys
    if (_engine.input.keyboard.wasPressed(ACTION_1_KEY)) {
      this.playerActions?.actionSwingSword();
      return;
    }

    if (_engine.input.keyboard.wasPressed(DASH_KEY)) {
      this.playerActions?.actionDash();
    }

    if (_engine.input.keyboard.wasPressed(POWER_UP_KEY)) {
      _engine.emit("showPowerUp", () => {});
    }

    if (this.hasSlingShot && _engine.input.keyboard.wasPressed(ACTION_2_KEY)) {
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

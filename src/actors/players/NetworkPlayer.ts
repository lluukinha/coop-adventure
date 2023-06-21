import * as ex from "excalibur";
import { ARROWACTION, SWORDACTION } from "../../constants.js";
import { generateCharacterAnimations } from "../../character-animations.js";
import { PlayerActions } from "./PlayerActions.js";
import { PlayerAnimations } from "./PlayerAnimations.js";
import { Player } from "./Player.js";

// These are just "ghosts" of other Players. They don't collide, they only update based on network updates
export class NetworkPlayer extends Player {
  public hasGhostPainState: boolean;
  public walkingMsLeft: number;

  constructor(x: number, y: number) {
    super(x, y, "BLUE");

    this.walkingMsLeft = 0;
    this.hasGhostPainState = false;
  }

  onInitialize(_engine: ex.Engine) {
    this.playerActions = new PlayerActions(this);
    this.playerAnimations = new PlayerAnimations(this);
  }

  // Redefine internal object of animations when the skinId changes
  regenAnimations(newSkinId: string) {
    console.log("skin changed to " + newSkinId);
    this.skinId = newSkinId;
    this.skinAnimations = generateCharacterAnimations(this.skinId);
  }

  // Convert a network update to friendly values for this actor
  onStateUpdate(newUpdate: any) {
    if (newUpdate.actionType === SWORDACTION && !this.actionAnimation) {
      this.playerActions?.actionSwingSword();
    }
    if (newUpdate.actionType === ARROWACTION && !this.actionAnimation) {
      this.playerActions?.actionShootArrow();
    }

    // Reset timer to show Walking MS for a bit if we have moved since last update
    const wasX = this.pos.x;
    const wasY = this.pos.y;
    this.pos.x = newUpdate.x;
    this.pos.y = newUpdate.y;
    const hasPosDiff = wasX !== this.pos.x || wasY !== this.pos.y;
    if (hasPosDiff) {
      this.walkingMsLeft = 100; //Assume walking for this time if new pos came in
    }

    // Use the latest facing and pain values from the network
    this.facing = newUpdate.facing ?? this.facing;
    this.hasGhostPainState = newUpdate.isInPain;

    // If we are newly in pain flashing, kick off a flash series
    const wasPainFlashing = this.isPainFlashing;
    if (!wasPainFlashing && newUpdate.isPainFlashing) {
      this.playerActions?.flashSeries();
    }

    // Redefine internal animations to new skin if a new one has come in
    if (this.skinId !== newUpdate.skinId) {
      this.regenAnimations(newUpdate.skinId);
    }
  }

  onPreUpdate(_engine: ex.Engine, _delta: number) {
    // Work on dedicated animation if we are doing one
    this.playerAnimations?.progressThroughActionAnimation(_delta);

    // work down walking
    if (this.walkingMsLeft > 0) {
      this.walkingMsLeft -= _delta;
    }

    // Update current animation according to state
    this.playerAnimations?.showRelevantAnimation();
  }
}

import { PAIN, WALK } from "../../constants";
import { NetworkPlayer } from "./NetworkPlayer";
import { Player } from "./Player";

export class PlayerAnimations {
    public actor: Player;
    constructor(actor: Player) {
        this.actor = actor;
    }

    progressThroughActionAnimation(delta: number) {
        const { actor } = this;
        if (!!actor.actionAnimation) {
            actor.vel.x = 0;
            actor.vel.y = 0;
            actor.actionAnimation.work(delta);
        }
    }

    showRelevantAnimation() {
        const { actor } = this;

        // Always prioritize showing PAIN if we are in pain
        if ((actor as NetworkPlayer).hasGhostPainState && !!actor.painState) {
            actor.graphics.use(actor.skinAnimations[actor.facing][PAIN]);
            return;
        }

        // If a dedicated action is happening, use that
        if (!!actor.actionAnimation) {
            actor.graphics.use(actor.actionAnimation.frame);
            return;
        }

        actor.graphics.use(actor.skinAnimations[actor.facing][WALK]);

        const actorGraphic = actor.graphics.current[0].graphic as any;
        const walkingMsLeft = actor.walkingMsLeft ?? 0;
        if (actor.vel.x !== 0 || actor.vel.y !== 0 || walkingMsLeft > 0) {
            actorGraphic.play();
            return;
        }

        actorGraphic.pause();
        actorGraphic.goToFrame(0);
    }
}
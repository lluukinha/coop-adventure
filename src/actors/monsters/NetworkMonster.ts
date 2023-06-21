import * as ex from "excalibur";

import { DOWN, PAIN, SCALE_2x, TAG_DAMAGES_PLAYER, WALK } from "../../constants.js";
import { Explosion } from "../Explosion.js";
import { IAnimationPayload, generateMonsterAnimations } from "../../character-animations.js";

 // Note this class simply shows a known Monster which is controlled by another player.
 export class NetworkMonster extends ex.Actor {
    public hasGhostPainState: boolean;
    public facing: string;
    public animations: IAnimationPayload;

   constructor(x: number, y: number) {
    super({
        pos: new ex.Vector(x, y),
        width: 16,
        height: 16,
        scale: SCALE_2x,
      });
     this.hasGhostPainState = false;
     this.facing = DOWN;
     this.animations = generateMonsterAnimations();
   }

   onInitialize(_engine: ex.Engine) {
     this.addTag(TAG_DAMAGES_PLAYER);
   }

   tookFinalDamage() {
     // Replace me with an explosion when owner client reports I am out of HP
     this.kill();
     this.scene?.engine?.add(new Explosion(this.pos.x, this.pos.y));
   }

   onPreUpdate(_engine: ex.Engine, _delta: number) {
     // Show correct appearance
     const pose = this.hasGhostPainState ? PAIN : WALK;
     const use = this.animations[pose][this.facing];
     this.graphics.use(use);
   }

   onStateUpdate({ x, y, facing, isInPain, hp }: { x:number, y: number, facing: string, isInPain: boolean, hp: number }) {
    this.pos.x = x;
    this.pos.y = y;
    this.facing = facing;
    this.hasGhostPainState = isInPain;

    // Destroy if gone
    if (hp <= 0) {
        this.tookFinalDamage();
        return;
    }
   }
 }
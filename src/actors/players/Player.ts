import * as ex from "excalibur";
import { ANCHOR_CENTER, DOWN, EVENT_SEND_PLAYER_UPDATE, LEFT, RIGHT, SCALE_2x, TAG_ANY_PLAYER, TAG_DAMAGES_PLAYER, TAG_PLAYER_WEAPON, UP, WALK } from "../../constants";
// import { DrawShapeHelper } from "../../classes/DrawShapeHelper";
import { IAnimationPayload, IPainState, generateCharacterAnimations } from "../../character-animations";
import { PlayerAnimations } from "./PlayerAnimations";
import { SpriteSequence } from "../../classes/SpriteSequence";
import { DirectionQueue } from "../../classes/DirectionQueue";
import { PlayerActions } from "./PlayerActions";
import { NetworkUpdater } from "../../classes/NetworkUpdater";
import { Arrow } from "../weapons/Arrow";
import { Sword } from "../weapons/Sword";
import { Monster } from "../monsters/Monster";

const ACTION_1_KEY = ex.Input.Keys.Z;
const ACTION_2_KEY = ex.Input.Keys.X;

const PLAYERS = [
    { key: ex.Input.Keys.Digit1, skinId: "RED" },
    { key: ex.Input.Keys.Digit2, skinId: "BLUE" },
    { key: ex.Input.Keys.Digit3, skinId: "GRAY" },
    { key: ex.Input.Keys.Digit4, skinId: "YELLOW" }
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
    public networkUpdater: NetworkUpdater | undefined;

    constructor(x: number, y: number, skinId: string) {
        super({
            pos: new ex.Vector(x, y),
            width: 32,
            height: 32,
            scale: SCALE_2x,
            collider: ex.Shape.Box(15, 15, ANCHOR_CENTER, new ex.Vector(0, 6)),
            collisionType: ex.CollisionType.Active,
            color: ex.Color.Green
        });

        this.directionQueue = new DirectionQueue();
        this.facing = DOWN;
        this.actionAnimation = null;
        this.skinId = skinId;
        this.skinAnimations = generateCharacterAnimations(skinId);
        this.graphics.use(this.skinAnimations[this.facing][WALK]);
        this.isPainFlashing = false;
        this.painState = null;
        this.addTag(TAG_ANY_PLAYER);
        this.on("collisionstart", (event) => this.onCollisionStart(event));
    }

    onInitialize(_engine: ex.Engine): void {
        this.playerAnimations = new PlayerAnimations(this);
        this.playerActions = new PlayerActions(this);
        this.networkUpdater = new NetworkUpdater(_engine, EVENT_SEND_PLAYER_UPDATE);
        this.sendUpdate();
    }

    sendUpdate() : void {
        const networkUpdateString = this.createNetworkUpdateString();
        this.networkUpdater?.sendStateUpdate(networkUpdateString);
    }

    onCollisionStart(event: ex.CollisionStartEvent<ex.Actor>) {
        // Take damage from other players weapons
        if (event.other.hasTag(TAG_PLAYER_WEAPON)) {
            const weapon = event.other as Sword | Arrow;
            if (weapon.owner !== this) {
                this.takeDamage((weapon.owner as Player).facing);
                weapon.onDamagedSomething();
            }
            return;
        }

        // Take damage from external things (Enemies, etc)
        if (event.other.hasTag(TAG_DAMAGES_PLAYER)) {
            console.log('enemy collided')
            this.takeDamage((event.other as Monster).facing);
        }
    }

    // Concats enough state to send to other players
    createNetworkUpdateString() {
        const actionType = this.actionAnimation?.type ?? "NULL";
        const isInPain = !!this.painState;
        const x = Math.round(this.pos.x);
        const y = Math.round(this.pos.y);
        return `${actionType}|${x}|${y}|${this.vel.x}|${this.vel.y}|${this.skinId}|${this.facing}|${isInPain}|${this.isPainFlashing}`;
    }

    calculateOppositeDirection(direction: string) : string {
        if (direction === LEFT) return RIGHT;
        if (direction === RIGHT) return LEFT;
        if (direction === UP) return DOWN;
        if (direction === DOWN) return UP;
        return UP;
    }

    takeDamage(damageComingFromDirection: string | null = null) {
        // NO Pain if already in pain
        // if (this.isPainFlashing) return;

        const facing = !!damageComingFromDirection ? this.calculateOppositeDirection(damageComingFromDirection) : this.facing;

        // Start a new pain moment
        const PAIN_VELOCITY = !!damageComingFromDirection ? 300 : 150;
        this.painState = {
            msLeft: 150,
            painVelX: facing === LEFT ? PAIN_VELOCITY : -PAIN_VELOCITY,
            painVelY: facing === UP ? PAIN_VELOCITY : -PAIN_VELOCITY
        }

        // Flash for a little bit
        this.playerActions?.flashSeries();

    }

    onPreUpdate(_engine: ex.Engine, _delta: number): void {
        this.directionQueue.update(_engine);

        // Work on dedicated animation if we are doing one
        this.playerAnimations?.progressThroughActionAnimation(_delta);

        if (!this.actionAnimation) {
            this.onPreUpdateMovement(_engine, _delta);
            this.onPreUpdateActionKeys(_engine);
        }

        // Show the right frames
        this.playerAnimations?.showRelevantAnimation();

        // Update everybody else
        this.sendUpdate()
    }

    onPreUpdateMovement(_engine: ex.Engine, _delta: number): void {
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
        const WALKING_SPEED = 160;

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
            this.playerActions?.actionShootArrow();
            return;
        }

        for(let i: number = 0; i < PLAYERS.length; i++){
            const { key, skinId } = PLAYERS[i];
            if (_engine.input.keyboard.wasPressed(key)) {
                this.skinId = skinId;
                this.skinAnimations = generateCharacterAnimations(this.skinId);
            }
        }

        // PLAYERS.forEach(({ key, skinId }) => {
        //     if (_engine.input.keyboard.wasPressed(key)) {
        //         this.skinId = skinId;
        //         this.skinAnimations = generateCharacterAnimations(this.skinId);
        //     }
        // });

        if (_engine.input.keyboard.wasPressed(ex.Input.Keys.M)) {
            const monster = new Monster(100, 100);
            _engine.add(monster);
        }

        // if (_engine.input.keyboard.wasPressed(ex.Input.Keys.Space)) {
        //     // TAKE DAMAGE
        //     this.takeDamage();
        //     return;
        // }

        return;
    }
}
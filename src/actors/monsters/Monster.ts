import * as ex from 'excalibur';
import {
  ANCHOR_CENTER,
  DOWN,
  EVENT_SEND_MONSTER_UPDATE,
  LEFT,
  PAIN,
  RIGHT,
  SCALE,
  SCALE_2x,
  TAG_ANY_PLAYER,
  TAG_DAMAGES_PLAYER,
  TAG_PLAYER_WEAPON,
  UP,
  WALK,
} from '../../constants';
import { guidGenerator, randomFromArray } from '../../helpers';
import {
  IAnimationPayload,
  IPainState,
  generateMonsterAnimations,
} from '../../character-animations';
import { Player } from '../players/Player';
import { NetworkUpdater } from '../../classes/NetworkUpdater';
import { Sword } from '../weapons/Sword';
import { Arrow } from '../weapons/Arrow';
import { Explosion } from '../Explosion';

const MONSTER_WALK_VELOCITY = 30;
const MONSTER_CHASE_VELOCITY = 65;
const MONSTER_DETECT_PLAYER_RANGE = 150;

export class Monster extends ex.Actor {
  public networkId: string;
  public painState: IPainState | null;
  public roamingPoint?: ex.Vector | null;
  public target: Player | null;
  public hp: number;
  public facing: string;
  public animations: IAnimationPayload;
  public networkUpdater: NetworkUpdater | undefined;

  constructor(x: number, y: number) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_2x,
      collider: ex.Shape.Box(11, 10, ANCHOR_CENTER, new ex.Vector(0, 4)),
      collisionType: ex.CollisionType.Active,
    });

    this.networkId = guidGenerator();
    this.painState = null;

    this.roamingPoint = null;
    this.target = null;
    this.hp = 3;
    this.facing = DOWN;
    this.animations = generateMonsterAnimations();

    this.on('collisionstart', (event: ex.CollisionStartEvent<ex.Actor>) => {
      this.onCollisionStart(event);
    });
  }

  onInitialize(_engine: ex.Engine): void {
    // Add to enemy group
    this.addTag(TAG_DAMAGES_PLAYER);

    // Choose random roaming point
    this.chooseRoamingPoint();

    // Periodically query for a new target
    void this.queryForTarget();

    // Send network updates
    this.networkUpdater = new NetworkUpdater(
      _engine,
      EVENT_SEND_MONSTER_UPDATE
    );
  }

  createNetworkUpdateString(): string {
    const hasPainState = !!this.painState;
    const x = Math.round(this.pos.x);
    const y = Math.round(this.pos.y);
    return `MONSTER|${this.networkId}|${x}|${y}|${this.vel.x}|${this.vel.y}|${this.facing}|${hasPainState}|${this.hp}`;
  }

  onCollisionStart(event: ex.CollisionStartEvent<ex.Actor>) {
    if (event.other.hasTag(TAG_PLAYER_WEAPON)) {
      const weapon = event.other as Sword | Arrow;
      if (weapon.isKilled() || weapon.isUsed) return;

      weapon.onDamagedSomething();
      this.takeDamage(weapon.direction);
    }
  }

  takeDamage(direction: string) {
    if (!!this.painState) return;

    // Reduce HP
    this.hp -= 1;

    // Check for death
    if (this.hp <= 0) {
      this.kill();
      const explosion = new Explosion(this.pos.x, this.pos.y);
      this.scene.engine.add(explosion);

      // Emit that we died. It matters otherwise other players don't hear about HP being 0
      const networkUpdateString = this.createNetworkUpdateString();
      this.networkUpdater?.sendStateUpdate(networkUpdateString);
      return;
    }

    let x = this.vel.x * -1;
    if (direction === LEFT) {
      x = -300;
    } else if (direction === RIGHT) {
      x = 300;
    }

    let y = this.vel.y * -1;
    if (direction === DOWN) {
      y = 300;
    } else if (direction === UP) {
      y = -300;
    }

    this.painState = {
      msLeft: 100,
      painVelX: x,
      painVelY: y,
    };
  }

  async queryForTarget() {
    // If we don't have a valid target
    if (!this.target || this.target?.isKilled()) {
      // Query all players on the map
      const playersQuery = this.scene.world.queryManager.getQuery([
        TAG_ANY_PLAYER,
      ]);
      // Filter down to nearby ones within pixel range
      const nearbyPlayers = playersQuery
        .getEntities()
        .filter((actor: ex.Entity) => {
          const actorDistance = this.pos.distance((actor as ex.Actor).pos);
          return actorDistance <= MONSTER_DETECT_PLAYER_RANGE;
        });
      // If we have results, choose a random one to target
      if (nearbyPlayers.length) {
        this.target = randomFromArray(nearbyPlayers) as Player;
      }
    }

    // Retry after X seconds
    await this.actions.delay(1500).toPromise();
    await this.queryForTarget();
  }

  chooseRoamingPoint() {
    const possibleRoamingSpots = [
      new ex.Vector(84 * SCALE, 96 * SCALE),
      new ex.Vector(210 * SCALE, 112 * SCALE),
      new ex.Vector(95 * SCALE, 181 * SCALE),
      new ex.Vector(224 * SCALE, 184 * SCALE),
    ];
    this.roamingPoint = randomFromArray(possibleRoamingSpots) as ex.Vector;
  }

  onPreUpdate(_engine: ex.Engine, _delta: number): void {
    this.onPreUpdateMove(_delta);

    // Show correct appearance
    this.onPreUpdateAnimation();

    // Update everybody
    const networkUpdateString = this.createNetworkUpdateString();
    this.networkUpdater?.sendStateUpdate(networkUpdateString);
  }

  onPreUpdateMove(_delta: number) {
    // Handle pain state first
    if (!!this.painState) {
      this.vel.x = this.painState.painVelX;
      this.vel.y = this.painState.painVelY;
      this.painState.msLeft -= _delta;
      if (this.painState.msLeft <= 0) {
        this.painState = null;
      }
      return;
    }

    // Pursue target or roaming point
    if (!!this.target) {
      this.moveTowardsTarget(this.target);
    } else if (!!this.roamingPoint) {
      this.moveTowardsRoamingPoint(this.roamingPoint);
    }
  }

  moveTowardsRoamingPoint(roamingPoint: ex.Vector) {
    // Move towards the point if far enough away
    const distance = roamingPoint.distance(this.pos);

    if (distance < 5) {
      this.chooseRoamingPoint();
      return;
    }

    if (this.pos.x < roamingPoint.x) {
      this.vel.x = MONSTER_WALK_VELOCITY;
    }
    if (this.pos.x > roamingPoint.x) {
      this.vel.x = -MONSTER_WALK_VELOCITY;
    }
    if (this.pos.y < roamingPoint.y) {
      this.vel.y = MONSTER_WALK_VELOCITY;
    }
    if (this.pos.y > roamingPoint.y) {
      this.vel.y = -MONSTER_WALK_VELOCITY;
    }
  }

  moveTowardsTarget(target: Player) {
    // Move towards the point if far enough away
    const destination = target.pos;
    const distance = target.pos.distance(this.pos);

    if (distance < 5) return;

    if (this.pos.x < destination.x) {
      this.vel.x = MONSTER_CHASE_VELOCITY;
    } else if (this.pos.x > destination.x) {
      this.vel.x = -MONSTER_CHASE_VELOCITY;
    }

    if (this.pos.y < destination.y) {
      this.vel.y = MONSTER_CHASE_VELOCITY;
    } else if (this.pos.y > destination.y) {
      this.vel.y = -MONSTER_CHASE_VELOCITY;
    }
  }

  faceTowardsPosition(pos: ex.Vector) {
    const xDiff = Math.abs(this.pos.x - pos.x);
    const yDiff = Math.abs(this.pos.y - pos.y);

    // Use axis that has the greatest distance
    if (xDiff > yDiff) {
      this.facing = this.pos.x > pos.x ? LEFT : RIGHT;
    } else {
      this.facing = this.pos.y > pos.y ? UP : DOWN;
    }

    // Choose correct frame
    const pose = this.painState ? PAIN : WALK;
    this.graphics.use(this.animations[pose][this.facing]);
  }

  onPreUpdateAnimation() {
    if (!this.target && !this.roamingPoint) return;
    const facePosition = this.target ? this.target.pos : this.roamingPoint!;
    this.faceTowardsPosition(facePosition);
  }
}

import * as ex from 'excalibur';
import { Images, Sounds } from '../../resources.js';
import {
  ANCHOR_CENTER,
  SCALE_3x,
  TAG_ANY_PLAYER,
  TAG_MONSTER,
  TAG_TELEPORT,
} from '../../constants.js';
import { Player } from '../players/Player.js';

const spriteSheet = ex.SpriteSheet.fromImageSource({
  image: Images.greenPortalSheetImage,
  grid: {
    columns: 8,
    rows: 3,
    spriteWidth: 64,
    spriteHeight: 64,
  },
});

const ANIMATION_SPEED = 80;

export class Teleport extends ex.Actor {
  public animations: { [key: string]: ex.Animation };
  public nextLevel: string;
  public player: Player | null = null;

  constructor(x: number, y: number, nextLevel: string) {
    super({
      pos: new ex.Vector(x, y),
      width: 16,
      height: 16,
      scale: SCALE_3x,
      collider: ex.Shape.Box(3, 10, ANCHOR_CENTER, new ex.Vector(0, 4)),
      collisionType: ex.CollisionType.Passive,
      z: 9,
      visible: false,
    });

    this.nextLevel = nextLevel;

    this.animations = {
      appearing: ex.Animation.fromSpriteSheet(
        spriteSheet,
        ex.range(8, 15),
        ANIMATION_SPEED
      ),
      disappearing: ex.Animation.fromSpriteSheet(
        spriteSheet,
        ex.range(16, 23),
        ANIMATION_SPEED
      ),
      idle: ex.Animation.fromSpriteSheet(
        spriteSheet,
        ex.range(0, 7),
        ANIMATION_SPEED
      ),
    };

    this.animations.appearing.strategy = ex.AnimationStrategy.End;
    this.animations.disappearing.strategy = ex.AnimationStrategy.End;
    this.animations.idle.strategy = ex.AnimationStrategy.Loop;

    this.animations.appearing.events.on('end', () => {
      this.graphics.use(this.animations.idle);
    });

    this.animations.disappearing.events.on('end', () => {
      if (!!this.player) this.player.graphics.visible = false;
      const event = new ex.GameEvent<string, string>();
      event.target = this.nextLevel;
      this.scene.engine.emit('levelup', event);
      this.kill();
    });

    this.graphics.use(this.animations.appearing);

    this.addTag(TAG_TELEPORT);
    this.on('collisionstart', (event) => this.onCollisionStart(event));
  }

  onPostUpdate(_engine: ex.Engine, _delta: number): void {
    const monsters = _engine.currentScene.actors.filter((a) =>
      a.hasTag(TAG_MONSTER)
    );
    if (monsters.length === 0) {
      this.graphics.visible = true;
    } else {
      this.graphics.visible = false;
    }
  }

  onCollisionStart(event: ex.CollisionStartEvent<ex.Actor>) {
    if (event.other.hasTag(TAG_ANY_PLAYER) && this.graphics.visible) {
      Sounds.teleportSound.play();
      const player = event.other as Player;
      this.player = player;
      this.player.pause();
      this.player.graphics.opacity = 1;
      this.player.actions.fade(0, 500);
      this.graphics.use(this.animations.disappearing);
    }
  }
}

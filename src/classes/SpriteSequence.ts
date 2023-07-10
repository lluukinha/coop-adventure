import * as ex from 'excalibur';
import { IFrameAnimation } from '../character-animations';

export class SpriteSequence {
  public type: string;
  public frameAnimations: IFrameAnimation[];
  public currentFrameIndex: number;
  public currentFrameProgress: number;
  public isDone: boolean;
  public onDone: CallableFunction;
  public actorObject: ex.Actor | null;

  constructor(
    type: string,
    frameAnimations: IFrameAnimation[] = [],
    onDone: CallableFunction
  ) {
    this.type = type;
    this.frameAnimations = frameAnimations;
    this.currentFrameIndex = 0;
    this.currentFrameProgress = 0;
    this.isDone = false;
    this.onDone = () => {
      this.isDone = true;
      onDone(this.actorObject);
    };

    this.actorObject = null;
  }

  get frame() {
    return this.frameAnimations[this.currentFrameIndex].frame;
  }

  work(delta: number) {
    if (this.isDone) return;
    const currentFrameDuration =
      this.frameAnimations[this.currentFrameIndex].duration;

    // Work on current frame
    if (this.currentFrameProgress < currentFrameDuration) {
      this.currentFrameProgress += delta;
      return;
    }

    if (this.currentFrameIndex + 1 < this.frameAnimations.length) {
      this.currentFrameIndex += 1;
      this.currentFrameProgress = 0;
      // Do new frame callback
      const nextConfig = this.frameAnimations[this.currentFrameIndex];
      if (!!nextConfig.actorObjCallback) {
        nextConfig.actorObjCallback(this.actorObject);
      }
      return;
    }

    this.onDone();
  }
}

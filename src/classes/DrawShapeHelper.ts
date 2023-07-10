import * as ex from 'excalibur';

export class DrawShapeHelper {
  constructor(actor: ex.Actor) {
    actor.scene.on('postdraw', ({ ctx }) => {
      const bounds = actor.collider.bounds;
      const { x: left, y: top } =
        actor.scene.engine.screen.worldToScreenCoordinates(
          ex.vec(bounds.left, bounds.top)
        );
      const { x: right, y: bottom } =
        actor.scene.engine.screen.worldToScreenCoordinates(
          ex.vec(bounds.right, bounds.bottom)
        );
      const newBounds = new ex.BoundingBox({ left, top, right, bottom });
      newBounds.draw(ctx, ex.Color.Yellow);
    });
  }
}

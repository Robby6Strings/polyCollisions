import { createPolygon, Polygon } from "./polygon"
import { IVec2, Vec2 } from "./vec"

export interface IEmitter {
  position: IVec2
  velocity: IVec2
  cooldown: number
}

export class Emitter implements IEmitter {
  tick: number = 0
  constructor(
    public position: Vec2,
    public velocity: Vec2,
    public cooldown: number
  ) {}

  public update(dt: number): Polygon | null {
    this.tick += dt
    if (this.tick >= this.cooldown) {
      this.tick = 0
      return createPolygon(this.position.copy(), this.velocity.copy())
    }
    return null
  }

  serialize(): IEmitter {
    return {
      position: this.position.serialize(),
      velocity: this.velocity.serialize(),
      cooldown: this.cooldown,
    }
  }

  static deserialize(e: IEmitter): Emitter {
    return new Emitter(
      Vec2.deserialize(e.position),
      Vec2.deserialize(e.velocity),
      e.cooldown
    )
  }
}

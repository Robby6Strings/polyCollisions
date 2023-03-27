const cos = Math.cos,
  sin = Math.sin,
  sqrt = Math.sqrt

export class Vec2 {
  public x: number
  public y: number

  constructor(x?: number, y?: number) {
    this.x = x ?? 0
    this.y = y ?? 0
  }

  distance(v: Vec2) {
    let x = v.x - this.x
    let y = v.y - this.y

    return Math.sqrt(x * x + y * y)
  }

  public normal(): Vec2 {
    const len = this.length()
    return new Vec2(this.x / len, this.y / len)
  }

  public dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y
  }

  public subtract(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y)
  }

  public add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y)
  }

  public clamp(other: Vec2): Vec2 {
    //prettier-ignore
    return new Vec2(
      Math.min(this.x, other.x),
      Math.min(this.y, other.y)
    )
  }

  public multiply(val: number): Vec2 {
    return new Vec2(this.x * val, this.y * val)
  }

  public copy(): Vec2 {
    return new Vec2(this.x, this.y)
  }

  public scale(val: number): Vec2 {
    return new Vec2(this.x * val, this.y * val)
  }

  public length() {
    const x = this.x * this.x
    const y = this.y * this.y
    return sqrt(x + y)
  }

  // public rotate(angle: number): Vec2 {
  //   const s = sin(angle)
  //   const c = cos(angle)
  //   const x = this.x * c - this.y * s
  //   const y = this.x * s + this.y * c
  //   return new Vec2(x, y)
  // }
  public rotate(angle: number): Vec2 {
    const s = sin(angle)
    const c = cos(angle)
    return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c)
  }

  public rotateAround(point: Vec2, angle: number): Vec2 {
    const x = point.x,
      y = point.y

    const rX = point.x + (x - point.x) * cos(angle) - (y - point.y) * sin(angle)
    const rY = point.y + (x - point.x) * sin(angle) + (y - point.y) * cos(angle)
    return new Vec2(rX, rY)
  }
}

export class Vec2 {
  public x: number
  public y: number

  constructor(x?: number, y?: number) {
    this.x = x ?? 0
    this.y = y ?? 0
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
    return Math.sqrt(x + y)
  }
}

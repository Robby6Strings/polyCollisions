class Point {
  constructor(public x: number, public y: number) {}
}
class TypedPoint<T> {
  constructor(public x: number, public y: number, public data: T) {}
}

export class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  contains(obj: Point | Rectangle): boolean {
    if (obj instanceof Point)
      return (
        obj.x >= this.x &&
        obj.y >= this.y &&
        obj.x <= this.x + this.width &&
        obj.y <= this.y + this.height
      )
    const pts: Point[] = [
      new Point(obj.x, obj.y),
      new Point(obj.x + obj.width, obj.y),
      new Point(obj.x + obj.width, obj.y + obj.height),
      new Point(obj.x, obj.y + obj.height),
    ]
    for (const pt of pts) {
      if (this.contains(pt)) return true
    }
    return false
  }

  intersects(range: Rectangle): boolean {
    return !(
      range.x > this.x + this.width ||
      range.x + range.width < this.x ||
      range.y > this.y + this.height ||
      range.y + range.height < this.y
    )
  }
}

export class TypedRectangle<T> extends Rectangle {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public data: T
  ) {
    super(x, y, width, height)
  }
}

class Quadtree<T> {
  readonly MAX_DEPTH = 3
  readonly MAX_POINTS = 6
  points: TypedPoint<T>[] = []
  rectangles: TypedRectangle<T>[] = []
  children: Quadtree<T>[] = []

  constructor(public bounds: Rectangle, public level: number = 0) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "purple"
    ctx.beginPath()
    ctx.strokeRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    )
    ctx.closePath()
    ctx.fillText(
      this.rectangles.length.toString(),
      this.bounds.x + 5,
      this.bounds.y + 10 + 10 * this.level
    )

    for (const c of this.children) {
      c.render(ctx)
    }
  }

  query(
    range: Rectangle,
    found: (TypedPoint<T> | TypedRectangle<T>)[] = []
  ): boolean {
    if (!this.bounds.intersects(range)) {
      return false
    }

    for (const point of this.points) {
      if (range.contains(point) && !found.find((pt) => pt === point)) {
        found.push(point)
      }
    }

    for (const rect of this.rectangles) {
      if (range.intersects(rect) && !found.find((r) => r === rect)) {
        found.push(rect)
      }
    }

    let len = this.children.length
    while (len--) {
      this.children[len].query(range, found)
    }

    return found.length > 0
  }
  insert(obj: TypedPoint<T> | TypedRectangle<T>) {
    if (
      !this.bounds.contains(obj) &&
      obj instanceof TypedRectangle &&
      !obj.contains(this.bounds)
    ) {
      return
    }

    if (obj instanceof TypedPoint) {
      this.points.push(obj)
    }

    if (obj instanceof TypedRectangle) {
      this.rectangles.push(obj)
    }

    if (this.children.length === 0 && this.level < this.MAX_DEPTH) {
      this.subdivide()
    }

    let len = this.children.length
    while (len--) {
      this.children[len].insert(obj)
    }

    return false
  }

  remove(obj: TypedPoint<T> | TypedRectangle<T>): boolean {
    if (obj instanceof Rectangle) {
      const idx = this.rectangles.findIndex((r) => r == obj)
      if (idx > -1) {
        this.rectangles.splice(idx, 1)
        return true
      }
    } else {
      const idx = this.points.findIndex((r) => r == obj)
      if (idx > -1) {
        this.rectangles.splice(idx, 1)
        return true
      }
    }

    for (const side of this.children) {
      if (side?.remove(obj)) return true
    }

    return false
  }

  // ...

  subdivide() {
    const x = this.bounds.x
    const y = this.bounds.y
    const w = this.bounds.width / 2
    const h = this.bounds.height / 2

    this.children = [
      new Quadtree<T>(new Rectangle(x, y, w, h), this.level + 1),
      new Quadtree<T>(new Rectangle(x + w, y, w, h), this.level + 1),
      new Quadtree<T>(new Rectangle(x, y + h, w, h), this.level + 1),
      new Quadtree<T>(new Rectangle(x + w, y + h, w, h), this.level + 1),
    ]

    const insertedPts: number[] = []
    const insertedRects: number[] = []
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i]
      for (const c of this.children) {
        if (c.insert(p)) insertedPts.push(i)
      }
    }

    for (let i = 0; i < this.rectangles.length; i++) {
      const r = this.rectangles[i]
      for (const c of this.children) {
        if (c.insert(r)) insertedRects.push(i)
      }
    }

    // this.rectangles = this.rectangles.filter(
    //   (_, index) => !insertedRects.includes(index)
    // )
    // this.points = this.points.filter((_, index) => !insertedPts.includes(index))
  }

  clear() {
    this.children = []
    this.points = []
    this.rectangles = []
  }
}

export const quadTree = new Quadtree(
  new Rectangle(0, 0, window.innerWidth, window.innerHeight)
)

//@ts-ignore
window.test = quadTree

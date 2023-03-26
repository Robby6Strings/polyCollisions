import { Polygon } from "./polygon"
import { Vec2 } from "./vec"

export interface Collision {
  a: Polygon
  b: Polygon
  mtv: Vec2
}

export type CollisionResult = Collision | null

export class Projection {
  constructor(public min: number, public max: number) {}

  overlap(other: Projection): number {
    return Math.min(this.max, other.max) - Math.max(this.min, other.min)
  }
}

export class SAT {
  static checkCollision(a: Polygon, b: Polygon): CollisionResult {
    //return SAT.narrowPhaseCollision(a, b)
    if (
      a.minX <= b.maxX &&
      a.maxX >= b.minX &&
      a.minY <= b.maxY &&
      a.maxY >= b.minY
    ) {
      return SAT.narrowPhaseCollision(a, b)
    }
    return null
  }

  static narrowPhaseCollision(a: Polygon, b: Polygon): CollisionResult {
    let mtv = new Vec2()
    let overlap = Number.MAX_VALUE
    const normals = a.getNormals().concat(b.getNormals())

    for (let i = 0; i < normals.length; i++) {
      const normal = normals[i]
      let aMin = Number.MAX_VALUE
      let aMax = Number.MIN_VALUE
      const verticesA = a.getVertices()

      for (let j = 0; j < verticesA.length; j++) {
        const projection = normal.dot(verticesA[j])
        aMin = Math.min(aMin, projection)
        aMax = Math.max(aMax, projection)
      }

      let bMin = Number.MAX_VALUE
      let bMax = Number.MIN_VALUE
      const verticesB = b.getVertices()

      for (let j = 0; j < verticesB.length; j++) {
        const projection = normal.dot(verticesB[j])
        bMin = Math.min(bMin, projection)
        bMax = Math.max(bMax, projection)
      }
      const o = Math.min(aMax, bMax) - Math.max(aMin, bMin)
      if (o < 0) {
        return null
      }
      if (o < overlap) {
        overlap = o
        mtv = normal.copy().multiply(overlap)
      }
    }
    return { a, b, mtv }
  }

  static resolveCollision(collision: Collision) {
    const { a, b, mtv } = collision
    if (a.isStatic && b.isStatic) return

    const direction = b.position.subtract(a.position).normal()
    const dotProduct = mtv.dot(direction)

    const _mtv = a.isStatic || b.isStatic ? mtv : mtv.multiply(0.5)
    const displacement1 = dotProduct < 0 ? _mtv.multiply(-1) : _mtv
    const displacement2 = displacement1.multiply(-1)

    if (!a.isStatic) {
      a.position = a.position.add(
        dotProduct < 0 ? displacement1 : displacement2
      )
      a.needsUpdate = true
    }
    if (!b.isStatic) {
      b.position = b.position.add(
        dotProduct < 0 ? displacement2 : displacement1
      )
      b.needsUpdate = true
    }
  }
}

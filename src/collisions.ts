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
    if (
      a.boundingBox.minX <= b.boundingBox.maxX &&
      a.boundingBox.maxX >= b.boundingBox.minX &&
      a.boundingBox.minY <= b.boundingBox.maxY &&
      a.boundingBox.maxY >= b.boundingBox.minY
    ) {
      return SAT.narrowPhaseCollision(a, b)
    }
    return null
  }

  static narrowPhaseCollision(a: Polygon, b: Polygon): CollisionResult {
    if (a.isStatic && b.isStatic) return null
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

    const _mtv =
      a.isStatic || b.isStatic ? mtv.multiply(0.9) : mtv.multiply(0.45)
    const displacement1 = dotProduct < 0 ? _mtv.multiply(-1) : _mtv
    const displacement2 = displacement1.multiply(-1)

    if (!a.isStatic) {
      const mod = dotProduct < 0 ? displacement1 : displacement2
      a.position = a.position.add(mod)

      // const V = a.velocity
      // const angle = Math.atan2(a.velocity.y - 20, a.velocity.x - 20)
      // const Va = V.multiply(Math.sin(angle)).magnitude() / 200
      // a.angularVelocity += Va

      a.velocity = a.velocity.add(mod)
      a.needsUpdate = true
    }
    if (!b.isStatic) {
      const mod = dotProduct < 0 ? displacement2 : displacement1
      b.position = b.position.add(mod)
      b.velocity = b.velocity.add(mod)
      b.needsUpdate = true
    }
  }

  static resolveCollisionIterative(collision: Collision) {
    const { a, b, mtv } = collision
    if (a.isStatic && b.isStatic) return

    const direction = b.position.subtract(a.position).normal()
    const dotProduct = mtv.dot(direction)

    const halfMtv = mtv.multiply(0.5)

    let d1 = dotProduct < 0 ? halfMtv.multiply(-1) : halfMtv
    let d2 = d1.multiply(-1)

    const maxIterations = 100
    let iteration = 0

    while (iteration < maxIterations && SAT.checkCollision(a, b)) {
      d1 = d1.multiply(0.5)
      d2 = d2.multiply(0.5)

      if (dotProduct < 0) {
        if (!a.isStatic) {
          a.position = a.position.add(d1)
          a.velocity = b.velocity.add(d1.multiply(0.1))
          a.needsUpdate = true
        }
        if (!b.isStatic) {
          b.position = b.position.add(d2)
          b.velocity = b.velocity.add(d2.multiply(0.1))
          b.needsUpdate = true
        }
      } else {
        if (!a.isStatic) {
          a.position = a.position.add(d2)
          a.velocity = a.velocity.add(d2.multiply(0.1))
          a.needsUpdate = true
        }
        if (!b.isStatic) {
          b.position = b.position.add(d1)
          b.velocity = a.velocity.add(d2.multiply(0.1))
          b.needsUpdate = true
        }
      }
      iteration++
    }
  }
}

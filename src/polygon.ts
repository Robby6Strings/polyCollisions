import { Projection } from "./collisions"
import { Vec2 } from "./vec"

export class Polygon {
  public vertices: Vec2[]
  public position: Vec2
  public rotation: number
  public isStatic: boolean = false
  public isColliding: boolean = false
  public velocity: Vec2 = new Vec2()
  public angularVelocity: number = 0

  constructor(position: Vec2, vertices: Vec2[], rotation?: number) {
    this.vertices = vertices
    this.position = position
    this.rotation = rotation ?? 0
  }

  project(normal: Vec2): Projection {
    // Transform the normal into the polygon's local space
    const localNormal = normal.subtract(this.position).rotate(-this.rotation)

    let min = Number.MAX_VALUE
    let max = Number.MIN_VALUE

    const verts = this.getVertices()
    for (let i = 0; i < verts.length; i++) {
      // Transform the vertex into the polygon's local space
      const localVertex = verts[i]

      const projection = localVertex.dot(localNormal)
      if (projection < min) {
        min = projection
      }
      if (projection > max) {
        max = projection
      }
    }
    return new Projection(min, max)
  }

  public getEdges(): Vec2[] {
    const edges: Vec2[] = []
    const verts = this.getVertices()
    for (let i = 0; i < verts.length; i++) {
      const edge = verts[(i + 1) % verts.length].subtract(verts[i])
      //const rotatedEdge = edge.rotate(this.rotation)
      edges.push(edge)
    }
    return edges
  }

  public getNormals(): Vec2[] {
    const normals: Vec2[] = []
    for (const edge of this.getEdges()) {
      normals.push(edge.normal())
    }
    return normals
  }

  public translate(translation: Vec2): void {
    this.position = this.position.add(translation)
  }

  public rotateBy(angle: number): void {
    this.rotation += angle
  }

  public getVertices(): Vec2[] {
    const transformedVertices: Vec2[] = []
    for (let i = 0; i < this.vertices.length; i++) {
      const transformedVertex = this.vertices[i]
        .rotate(this.rotation)
        .add(this.position)
      transformedVertices.push(transformedVertex)
    }
    return transformedVertices
  }
}

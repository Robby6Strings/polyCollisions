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
    this.position = position ?? new Vec2()
    this.rotation = rotation ?? 0
  }

  public getEdges(): Vec2[] {
    const edges: Vec2[] = []
    for (let i = 0; i < this.vertices.length; i++) {
      const edge = this.vertices[(i + 1) % this.vertices.length].subtract(
        this.vertices[i]
      )
      const rotatedEdge = this.rotate(edge, this.rotation)
      edges.push(rotatedEdge)
    }
    return edges
  }

  public rotate(vector: Vec2, angle: number): Vec2 {
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const x = vector.x * cos - vector.y * sin
    const y = vector.x * sin + vector.y * cos
    return new Vec2(x, y).add(this.position)
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
      const transformedVertex = this.rotate(this.vertices[i], this.rotation)
      transformedVertices.push(transformedVertex)
    }
    return transformedVertices
  }
}

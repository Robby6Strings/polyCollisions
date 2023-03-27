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
  private normals: Vec2[] = []
  private _transformedVertices: Vec2[] = []
  minX: number = 0
  maxX: number = 0
  minY: number = 0
  maxY: number = 0
  needsUpdate: boolean = true

  constructor(position: Vec2, vertices: Vec2[], rotation?: number) {
    this.vertices = vertices
    this.position = position
    this.rotation = rotation ?? 0
  }

  render(ctx: CanvasRenderingContext2D): void {
    const vertices = this.getVertices()
    ctx.strokeStyle = this.isColliding ? "red" : "green"
    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (const vertex of vertices) {
      ctx.lineTo(vertex.x, vertex.y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  renderBounds(ctx: CanvasRenderingContext2D): void {
    const { minX, minY, maxX, maxY } = this
    ctx.beginPath()
    ctx.moveTo(minX, minY)
    ctx.lineTo(maxX, minY)
    ctx.lineTo(maxX, maxY)
    ctx.lineTo(minX, maxY)
    ctx.closePath()
    ctx.stroke()
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

  public updateNormals(): void {
    this.normals = []
    for (const edge of this.getEdges()) {
      this.normals.push(edge.normal())
    }
    this.needsUpdate = false
  }

  public getNormals(): Vec2[] {
    if (this.needsUpdate) this.updateNormals()
    return this.normals
  }

  public translate(translation: Vec2): void {
    this.position = this.position.add(translation)
  }

  public rotateBy(angle: number): void {
    this.rotation += angle
  }

  updateVertices(): void {
    this._transformedVertices = []
    this.minX = Infinity
    this.minY = Infinity
    this.maxX = -Infinity
    this.maxY = -Infinity

    for (let i = 0; i < this.vertices.length; i++) {
      const transformedVertex = this.vertices[i]
        .rotate(this.rotation)
        .add(this.position)

      if (transformedVertex.x < this.minX) this.minX = transformedVertex.x
      if (transformedVertex.y < this.minY) this.minY = transformedVertex.y

      if (transformedVertex.x > this.maxX) this.maxX = transformedVertex.x
      if (transformedVertex.y > this.maxY) this.maxY = transformedVertex.y
      this._transformedVertices.push(transformedVertex)
    }
  }

  public getVertices(): Vec2[] {
    if (this.needsUpdate) this.updateVertices()
    return this._transformedVertices
  }
}

function genPolygonVerts(n: number): Vec2[] {
  const verts: Array<Vec2> = []
  for (let i = 1; i <= n; i++) {
    const angle = i * ((2 * Math.PI) / n)
    verts.push(new Vec2(Math.cos(angle), Math.sin(angle)))
  }
  return verts
}
export const createPoly = (pos: Vec2, n: number) =>
  new Polygon(
    pos,
    genPolygonVerts(n).map((v) => v.scale(25))
  )

import { IVec2, Vec2 } from "./vec"
import { QuadTree } from "./quadTree"
import { appState } from "../appState"
import { SAT } from "./SAT"

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface IPolygon {
  vertices: IVec2[]
  position: IVec2
  rotation: number
  velocity: IVec2
  isStatic: boolean
}

export class Polygon implements IPolygon {
  public vertices: Vec2[]
  public position: Vec2
  public rotation: number
  public isStatic: boolean = false
  public isColliding: boolean = false
  public velocity: Vec2 = new Vec2()
  public angularVelocity: number = 0
  private normals: Vec2[] = []
  private _transformedVertices: Vec2[] = []
  public quadTreeRect: QuadTree.TypedRectangle<Polygon> =
    new QuadTree.TypedRectangle(0, 0, 0, 0, this)
  public boundingBox: BoundingBox = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  }

  needsUpdate: boolean = true

  constructor(
    position: Vec2,
    vertices: Vec2[],
    rotation?: number,
    isStatic?: boolean
  ) {
    this.vertices = vertices
    this.position = position
    this.rotation = rotation ?? 0
    this.isStatic = isStatic ?? false
  }

  render(ctx: CanvasRenderingContext2D): void {
    const vertices = this.getVertices()
    const { options } = appState.state

    if (options.renderPolyData) {
      ctx.fillStyle = "#777"
      ctx.fillText(
        `(${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)})`,
        this.boundingBox.minX,
        this.boundingBox.minY - 5
      )
    }

    ctx.fillStyle = "#555"

    ctx.strokeStyle = this.isColliding ? "red" : "green"
    ctx.lineWidth = options.strokeWidth

    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (const vertex of vertices) {
      ctx.lineTo(vertex.x, vertex.y)
    }
    ctx.closePath()
    ctx.stroke()
    if (options.renderPolyBackgrounds) ctx.fill()
    ctx.lineWidth = 1
  }
  renderBounds(ctx: CanvasRenderingContext2D): void {
    const { minX, minY, maxX, maxY } = this.boundingBox
    ctx.beginPath()
    ctx.moveTo(minX, minY)
    ctx.lineTo(maxX, minY)
    ctx.lineTo(maxX, maxY)
    ctx.lineTo(minX, maxY)
    ctx.closePath()
    ctx.stroke()
  }

  project(normal: Vec2): SAT.Projection {
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
    return new SAT.Projection(min, max)
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
    this.boundingBox.minX = Infinity
    this.boundingBox.minY = Infinity
    this.boundingBox.maxX = -Infinity
    this.boundingBox.maxY = -Infinity

    for (let i = 0; i < this.vertices.length; i++) {
      const transformedVertex = this.vertices[i]
        .rotate(this.rotation)
        .add(this.position)

      //prettier-ignore
      if (transformedVertex.x < this.boundingBox.minX) this.boundingBox.minX = transformedVertex.x
      //prettier-ignore
      if (transformedVertex.y < this.boundingBox.minY) this.boundingBox.minY = transformedVertex.y
      //prettier-ignore
      if (transformedVertex.x > this.boundingBox.maxX) this.boundingBox.maxX = transformedVertex.x
      //prettier-ignore
      if (transformedVertex.y > this.boundingBox.maxY) this.boundingBox.maxY = transformedVertex.y

      this._transformedVertices.push(transformedVertex)
    }

    this.quadTreeRect.x = this.boundingBox.minX
    this.quadTreeRect.y = this.boundingBox.minY
    this.quadTreeRect.width = this.boundingBox.maxX - this.boundingBox.minX
    this.quadTreeRect.height = this.boundingBox.maxY - this.boundingBox.minY
  }

  public getVertices(): Vec2[] {
    if (this.needsUpdate) this.updateVertices()
    return this._transformedVertices
  }

  public serialize(): IPolygon {
    return {
      vertices: this.vertices.map((v) => v.serialize()),
      position: this.position.serialize(),
      rotation: this.rotation,
      velocity: this.velocity.serialize(),
      isStatic: this.isStatic,
    }
  }

  public static deserialize(data: IPolygon): Polygon {
    const { vertices, position, rotation, velocity, isStatic } = data
    const poly = new Polygon(
      Vec2.deserialize(position),
      vertices.map((v) => Vec2.deserialize(v)),
      rotation,
      isStatic
    )
    poly.velocity = Vec2.deserialize(velocity)
    return poly
  }
}

export function genPolygonVerts(n: number): Vec2[] {
  const verts: Array<Vec2> = []
  for (let i = 1; i <= n; i++) {
    const angle = i * ((2 * Math.PI) / n)
    verts.push(new Vec2(Math.cos(angle), Math.sin(angle)))
  }
  return verts
}

export function createPolygon(pos: Vec2, vel?: Vec2): Polygon {
  const { randomizeNumVertices, maxPolyVertices, polySize } =
    appState.state.options

  const n = randomizeNumVertices
    ? Math.floor(3 + Math.random() * (maxPolyVertices - 3))
    : maxPolyVertices

  const poly = new Polygon(
    pos,
    genPolygonVerts(n).map((v) => v.scale(polySize))
  )
  if (vel) poly.velocity = vel
  poly.updateVertices()
  return poly
}

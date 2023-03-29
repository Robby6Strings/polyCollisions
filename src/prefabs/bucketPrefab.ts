import { genPolygonVerts, Polygon } from "../polygon"
import { Vec2 } from "../vec"

export function createBucketPrefab(): Polygon[] {
  const numVerts = 5
  const size = 20
  const wallVertices: Array<Vec2> = [
    new Vec2(-40, -200),
    new Vec2(40, -200),
    new Vec2(40, 200),
    new Vec2(-40, 200),
  ]
  const wall = new Polygon(new Vec2(90, 360), wallVertices, 0, true)
  const wall2 = new Polygon(new Vec2(710, 360), wallVertices, 0, true)
  const wall3 = new Polygon(
    new Vec2(240, 680),
    wallVertices,
    -(Math.PI / 180) * 45,
    true
  )
  const wall4 = new Polygon(
    new Vec2(580, 680),
    wallVertices,
    (Math.PI / 180) * 45,
    true
  )

  const res = [wall, wall2, wall3, wall4]

  for (let i = 0; i < 10; i++) {
    res.push(
      Object.assign(
        new Polygon(
          new Vec2(200, 300),
          genPolygonVerts(numVerts).map((v) => v.scale(size))
        ),
        {
          velocity: new Vec2(5, -3),
        }
      )
    )
  }

  return res
}

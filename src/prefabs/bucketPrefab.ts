import { Emitter } from "../lib/emitter"
import { Polygon } from "../lib/polygon"
import { IPrefab } from "../lib/prefab"
import { Vec2 } from "../lib/vec"

export function createBucketPrefab(): IPrefab {
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

  const polygons = [wall, wall2, wall3, wall4]

  return {
    polygons,
    emitters: [new Emitter(new Vec2(100, 100), new Vec2(5, 0), 500)],
  }
}

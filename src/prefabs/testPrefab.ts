import { genPolygonVerts, Polygon } from "../lib/polygon"
import { IPrefab } from "../lib/prefab"
import { Vec2 } from "../lib/vec"
import { createDefaultPrefab } from "./defaultPrefab"

export function createTestPrefab(): IPrefab {
  const defaultPrefab = createDefaultPrefab()
  const numVerts = 5
  const size = 20
  const testPoly = new Polygon(
    new Vec2(200, 300),
    genPolygonVerts(numVerts).map((v) => v.scale(size))
  )
  testPoly.velocity = new Vec2(35, -3)
  return {
    polygons: [...defaultPrefab.polygons, testPoly],
  }
}

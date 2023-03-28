import { genPolygonVerts, Polygon } from "../polygon"
import { Vec2 } from "../vec"
import { createDefaultPrefab } from "./defaultPrefab"

export function createTestPrefab(): Polygon[] {
  const items = createDefaultPrefab()
  const numVerts = 5
  const size = 20
  const testPoly = new Polygon(
    new Vec2(200, 300),
    genPolygonVerts(numVerts).map((v) => v.scale(size))
  )
  testPoly.velocity = new Vec2(35, -3)
  return [...items, testPoly]
}

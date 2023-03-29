import { Polygon } from "../polygon"
import { IPrefab } from "../prefab"
import { Vec2 } from "../vec"

export function createDefaultPrefab(): IPrefab {
  const floorVertices: Array<Vec2> = [
    new Vec2(-350, -40),
    new Vec2(350, -40),
    new Vec2(350, 40),
    new Vec2(-350, 40),
  ]

  const floor = new Polygon(new Vec2(400, 600), floorVertices, 0, true)

  const wallVertices: Array<Vec2> = [
    new Vec2(-40, -200),
    new Vec2(40, -200),
    new Vec2(40, 200),
    new Vec2(-40, 200),
  ]
  const wall = new Polygon(new Vec2(90, 360), wallVertices, 0, true)
  const wall2 = new Polygon(new Vec2(710, 360), wallVertices, 0, true)

  return {
    polygons: [floor, wall, wall2],
  }
}

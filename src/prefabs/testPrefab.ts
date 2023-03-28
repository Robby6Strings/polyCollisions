import { Polygon } from "../polygon"
import { Vec2 } from "../vec"

export function createTestPrefab(): Polygon[] {
  const floorVertices: Array<Vec2> = [
    new Vec2(-window.innerWidth / 2, -40),
    new Vec2(window.innerWidth / 2, -40),
    new Vec2(window.innerWidth / 2, 40),
    new Vec2(-window.innerWidth / 2, 40),
  ]

  const floor = new Polygon(
    new Vec2(window.innerWidth / 2, window.innerHeight - 80),
    floorVertices,
    0,
    true
  )

  const wallVertices: Array<Vec2> = [
    new Vec2(-40, -200),
    new Vec2(40, -200),
    new Vec2(40, 200),
    new Vec2(-40, 200),
  ]
  const wall = new Polygon(
    new Vec2(40, window.innerHeight - 320),
    wallVertices,
    0,
    true
  )

  return [floor, wall]
}

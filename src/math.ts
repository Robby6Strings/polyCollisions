import { Vec2 } from "./vec"
export function normalizeCoords(vec: Vec2): Vec2 {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement
  const screenSize = new Vec2(canvas.width, canvas.height)
  const x = (vec.x - 0) / (screenSize.x - 0)
  const y = (vec.y - 0) / (screenSize.y - 0)
  return new Vec2(x, y)
}

export function denormalizeCoords(vec: Vec2): Vec2 {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement
  const screenSize = new Vec2(canvas.width, canvas.height)
  const x = vec.x * (screenSize.x - 0) + 0
  const y = vec.y * (screenSize.y - 0) + 0

  return new Vec2(x, y)
}

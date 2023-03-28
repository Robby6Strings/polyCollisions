import { Vec2 } from "./vec"

export function getWindowSize() {
  return new Vec2(window.innerWidth, window.innerHeight)
}

export function normalize(value: Vec2) {
  const windowSize = getWindowSize()
  //normalize from 0 to window size to -1 to 1
  const x = (value.x / windowSize.x) * 2 - 1
  const y = (value.y / windowSize.y) * 2 - 1

  return new Vec2(x, y)
}

export function denormalize(value: Vec2) {
  // Get the size of the window
  const windowSize: Vec2 = getWindowSize()

  // Get the x and y coordinates of the value
  const x: number = ((value.x + 1) / 2) * windowSize.x
  const y: number = ((1 - value.y) / 2) * windowSize.y

  // Return the denormalized coordinates
  return new Vec2(x, y)
}

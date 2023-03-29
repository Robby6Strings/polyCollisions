import { Vec2 } from "./vec"

export function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime() //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0 //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

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

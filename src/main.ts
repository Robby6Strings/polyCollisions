import { SAT } from "./collisions"
import "./style.css"
import { Polygon } from "./polygon"
import { Vec2 } from "./vec"

function setup() {}

document.addEventListener("ready", setup)

const canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")

function genHexagonVerts(): Array<Vec2> {
  const verts: Array<Vec2> = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    verts.push(new Vec2(Math.cos(angle), Math.sin(angle)))
  }
  return verts
}

function genTriangleVerts(): Array<Vec2> {
  const verts: Array<Vec2> = []
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI / 3) * i
    verts.push(new Vec2(Math.cos(angle), Math.sin(angle)))
  }
  return verts
}

const triangleVertices = [
  // new Vec2(-25, 0), new Vec2(0, -50), new Vec2(25, 0)
  ...genTriangleVerts().map((v) => v.scale(25)),
]
const hexagonVertices = [
  ...genHexagonVerts().map((v) => v.scale(25)),
  // new Vec2(-50, -25),
  // new Vec2(-25, -50),
  // new Vec2(25, -50),
  // new Vec2(50, -25),
  // new Vec2(25, 25),
  // new Vec2(-25, 25),
]

const floorVertices: Array<Vec2> = [
  new Vec2(-window.innerWidth / 2, -40),
  new Vec2(window.innerWidth / 2, -40),
  new Vec2(window.innerWidth / 2, 80),
  new Vec2(-window.innerWidth / 2, 80),
]

const createTriangle = () =>
  new Polygon(new Vec2(120, 220), triangleVertices, Math.PI / 4)
const createHexagon = () =>
  new Polygon(new Vec2(150, 250), hexagonVertices, Math.PI / 6)

const shapes: Array<Polygon> = [
  createTriangle(),
  createHexagon(),
  new Polygon(
    new Vec2(window.innerWidth / 2, window.innerHeight - 20),
    floorVertices
  ),
]
shapes[0].angularVelocity = 0.0125
shapes[1].angularVelocity = 0.0125
shapes[2].isStatic = true

function update() {
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i]
    shape.isColliding = false
    if (!shape.isStatic) {
      shape.rotateBy(shape.angularVelocity)
      shape.velocity = shape.velocity
        .add(new Vec2(0, 0.015))
        .clamp(new Vec2(0, 5))
      shape.position = shape.position.add(shape.velocity)
      shape.needsUpdate = true
    }
  }

  for (let i = 0; i < shapes.length; i++) {
    const a = shapes[i]
    for (let j = 0; j < shapes.length; j++) {
      const b = shapes[j]

      if (a == b) continue

      const collision = SAT.checkCollision(a, b)
      if (collision) {
        a.isColliding = true
        b.isColliding = true
        if (collision) SAT.resolveCollision(collision)
      }
    }
  }
}

function render() {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i]
    shape.render(ctx)
    //shape.renderBounds(ctx)
  }

  ctx.fillStyle = "yellow"
  ctx.fillText(shapes.length.toString(), 10, 10)
}

let isMouseDown = false
let mousePos = new Vec2()

function tick() {
  if (isMouseDown) {
    const shape = createHexagon()
    shape.position = new Vec2(mousePos.x, mousePos.y)
    shape.angularVelocity = 0.0125
    shapes.push(shape)
  }
  update()
  render()
  requestAnimationFrame(tick)
}

tick()
// setInterval(() => {
//   tick()
// }, 1000 / 120)

canvas.addEventListener("mousedown", () => (isMouseDown = true))
canvas.addEventListener("mouseup", () => (isMouseDown = false))

canvas.addEventListener("mousemove", (e) => {
  const x = e.clientX
  const y = e.clientY
  mousePos = new Vec2(x, y)
})

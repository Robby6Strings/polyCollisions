import { SAT } from "./collisions"
import "./style.css"
import { Polygon } from "./polygon"
import { Vec2 } from "./vec"

const shapes: Array<Polygon> = []
const inputs = {
  m0: false,
  m1: false,
  mPos: new Vec2(),
}

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
    const angle = (Math.PI / 3) * i * 2
    verts.push(new Vec2(Math.cos(angle), Math.sin(angle)))
  }
  return verts
}

const triangleVertices = [...genTriangleVerts().map((v) => v.scale(25))]
const hexagonVertices = [...genHexagonVerts().map((v) => v.scale(25))]

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

const floor = new Polygon(
  new Vec2(window.innerWidth / 2, window.innerHeight - 80),
  floorVertices
)
floor.isStatic = true
shapes.push(floor)

function update() {
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i]
    shape.isColliding = false
    if (!shape.isStatic) {
      shape.rotateBy(shape.angularVelocity)
      if (inputs.m1) {
        const gravAngle = Math.atan2(
          inputs.mPos.y - shape.position.y,
          inputs.mPos.x - shape.position.x
        )
        const dist = shape.position.distance(inputs.mPos)
        const gravForce = dist / 50
        shape.velocity.x += Math.cos(gravAngle) * gravForce
        shape.velocity.y += Math.sin(gravAngle) * gravForce
      }

      shape.velocity = shape.velocity.multiply(0.95)
      shape.velocity.y += 1
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

function tick() {
  if (inputs.m0) {
    const shape = Math.random() > 0.5 ? createHexagon() : createTriangle()
    shape.position = inputs.mPos.copy()
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

canvas.addEventListener("mousedown", (event) => {
  toggleMouseInput(event.button, true)
})
canvas.addEventListener("mouseup", (event) => {
  toggleMouseInput(event.button, false)
})
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault()
})

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  floor.position.y = window.innerHeight - 80
})

function toggleMouseInput(btn: number, val: boolean) {
  inputs[btn == 0 ? "m0" : "m1"] = val
}

canvas.addEventListener("mousemove", (e) => {
  const x = e.clientX
  const y = e.clientY
  inputs.mPos = new Vec2(x, y)
})

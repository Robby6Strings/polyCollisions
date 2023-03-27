import "./style.css"
import { SAT } from "./collisions"
import { createPolygon, Polygon } from "./polygon"
import { Vec2 } from "./vec"
import { options, createOptionsUI } from "./options"
import { inputs } from "./inputs"

document.body.appendChild(createOptionsUI())

let loopRef = 0,
  frameStartTime = 0,
  shapes: Array<Polygon> = []

const canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")

//create walls
{
  const floorVertices: Array<Vec2> = [
    new Vec2(-window.innerWidth / 2, -40),
    new Vec2(window.innerWidth / 2, -40),
    new Vec2(window.innerWidth / 2, 80),
    new Vec2(-window.innerWidth / 2, 80),
  ]

  const floor = new Polygon(
    new Vec2(window.innerWidth / 2, window.innerHeight - 80),
    floorVertices
  )
  floor.isStatic = true
  shapes.push(floor)

  const wallVertices: Array<Vec2> = [
    new Vec2(-40, -200),
    new Vec2(40, -200),
    new Vec2(40, 200),
    new Vec2(-40, 200),
  ]
  const wall = new Polygon(new Vec2(40, window.innerHeight - 320), wallVertices)
  wall.isStatic = true
  shapes.push(wall)

  const wall2 = new Polygon(
    new Vec2(window.innerWidth - 40, window.innerHeight - 320),
    wallVertices
  )
  wall2.isStatic = true
  shapes.push(wall2)
}
//event listeners
{
  window.addEventListener("blur", () => {
    if (options.pauseOnBlur) cancelAnimationFrame(loopRef)
  })
  window.addEventListener("focus", () => {
    if (options.pauseOnBlur) main()
  })

  function toggleMouseInput(btn: number, val: boolean) {
    inputs[btn == 0 ? "m0" : "m1"] = val
  }

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
  })

  canvas.addEventListener("mousemove", (e) => {
    const x = e.clientX
    const y = e.clientY
    inputs.mPos = new Vec2(x, y)
  })
}

function main() {
  if (inputs.m0) shapes.push(createPolygon())
  frameStartTime = performance.now()
  update()
  render(performance.now() - frameStartTime)
  loopRef = requestAnimationFrame(main)
}
main()

function update() {
  //cull offscreen shapes
  shapes = shapes.filter((s) => {
    return (
      s.position.x < window.innerWidth + 100 &&
      s.position.x > -100 &&
      s.position.y < window.innerHeight + 100 &&
      s.position.y > -100
    )
  })
  updatePhysics()
  handleCollisions()
}
function updatePhysics() {
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i]
    shape.isColliding = false
    if (!shape.isStatic) {
      shape.rotateBy(shape.angularVelocity)

      // r-click blackhole
      if (inputs.m1) {
        const gravAngle = Math.atan2(
          inputs.mPos.y - shape.position.y,
          inputs.mPos.x - shape.position.x
        )
        const dist = shape.position.distance(inputs.mPos)
        const gravForce = dist / 100
        shape.velocity.x += Math.cos(gravAngle) * gravForce
        shape.velocity.y += Math.sin(gravAngle) * gravForce
      }

      shape.velocity.y += 0.2 // gravity
      shape.velocity = shape.velocity.multiply(0.975) // friction
      shape.position = shape.position.add(shape.velocity)
      shape.needsUpdate = true
    }
  }
}
function handleCollisions() {
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

function render(dt: number) {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i]
    shape.render(ctx)
    if (options.renderBounds && shape.vertices.length !== 4)
      shape.renderBounds(ctx)
  }

  ctx.fillStyle = "yellow"
  ctx.fillText(`${shapes.length} polygons`, 10, 10)
  ctx.fillText(`${dt}ms`, 10, 20)
}

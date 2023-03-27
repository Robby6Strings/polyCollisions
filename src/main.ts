import { SAT } from "./collisions"
import "./style.css"
import { createPoly, Polygon } from "./polygon"
import { Vec2 } from "./vec"

let ts = performance.now()
let shapes: Array<Polygon> = []
const maxPolyVertices = 15
const options = {
  renderBounds: false,
}

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

function spawnRandomShape() {
  const n = Math.floor(3 + Math.random() * (maxPolyVertices - 3))
  const shape = createPoly(inputs.mPos.copy(), n)
  shape.angularVelocity = 0.0125
  shapes.push(shape)
}

function createUI() {
  const optsBox = document.createElement("div")
  optsBox.style.position = "absolute"
  optsBox.style.right = "0"
  optsBox.style.top = "0"
  optsBox.style.padding = "6px"
  optsBox.style.backgroundColor = "rgba(0,0,0,.3)"
  document.body.appendChild(optsBox)

  const boundsRenderingToggler = Object.assign(
    document.createElement("input"),
    {
      id: "boundsRender",
      type: "checkbox",
      onchange: () => {
        options.renderBounds = boundsRenderingToggler.checked
      },
    }
  )
  optsBox.appendChild(boundsRenderingToggler)
  const lbl = Object.assign(document.createElement("label"), {
    innerText: "render bounding boxes",
  })
  lbl.htmlFor = boundsRenderingToggler.id
  optsBox.appendChild(lbl)
}
createUI()

function createWalls() {
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
createWalls()

function cullOutOfBoundsShapes() {
  shapes = shapes.filter((s) => {
    return (
      s.position.x < window.innerWidth + 100 &&
      s.position.x > -100 &&
      s.position.y < window.innerHeight + 100 &&
      s.position.y > -100
    )
  })
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

function update() {
  cullOutOfBoundsShapes()
  updatePhysics()
  handleCollisions()
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

function tick() {
  if (inputs.m0) spawnRandomShape()
  ts = performance.now()
  update()
  render(performance.now() - ts)
  requestAnimationFrame(tick)
}

tick()
// setInterval(() => {
//   tick()
// }, 1000 / 120)

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

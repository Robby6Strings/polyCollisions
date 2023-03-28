import "./style.css"
import { SAT } from "./collisions"
import { createPolygon, Polygon } from "./polygon"
import { keyMap, inputs } from "./inputs"
import { quadTree, TypedRectangle } from "./quadTree"
import { addShape, loadPrefab, state, updateShapes } from "./state"
import { setupOptionsUI } from "./html"
import { Prefab } from "./prefab"

const canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")

loadPrefab(Prefab.Default)

//event listeners
{
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

  window.addEventListener("keydown", (event) => {
    keyMap.get(event.key)?.(main)
  })
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  canvas.addEventListener("mousemove", (e) => {
    inputs.mPos.x = e.clientX
    inputs.mPos.y = e.clientY
  })
}

function main() {
  if (inputs.m0) {
    addShape(createPolygon())
  }
  const frameStartTime = performance.now()
  update()
  quadTree.clear()
  let len = state.shapes.length
  while (len--) {
    quadTree.insert(state.shapes[len].quadTreeRect)
  }
  render(performance.now() - frameStartTime)
}

setupOptionsUI(main)

function update() {
  //cull offscreen shapes
  updateShapes((items: Polygon[]) => {
    return items.filter((s: Polygon) => {
      return (
        s.position.x < window.innerWidth + 100 &&
        s.position.x > -100 &&
        s.position.y < window.innerHeight + 100 &&
        s.position.y > -100
      )
    })
  })

  updatePhysics()
  handleCollisions_QuadTree()
}
function updatePhysics() {
  for (let i = 0; i < state.shapes.length; i++) {
    const shape = state.shapes[i]
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

      shape.velocity.y += state.options.gravity // gravity
      shape.velocity = shape.velocity.multiply(0.935) // friction
      shape.angularVelocity = shape.angularVelocity * 0.4
      shape.position = shape.position.add(shape.velocity)
      shape.needsUpdate = true
    }
  }
}
// function handleCollisions() {
//   for (let i = 0; i < state.shapes.length; i++) {
//     const a = state.shapes[i]
//     for (let j = 0; j < state.shapes.length; j++) {
//       const b = state.shapes[j]

//       if (a == b) continue

//       const collision = SAT.checkCollision(a, b)
//       if (collision) {
//         a.isColliding = true
//         b.isColliding = true
//         if (collision) SAT.resolveCollision(collision)
//       }
//     }
//   }
// }
function handleCollisions_QuadTree() {
  for (let i = 0; i < state.shapes.length; i++) {
    const a = state.shapes[i]
    //if (a.isStatic) continue
    const potentials: TypedRectangle<Polygon>[] = []
    if (!quadTree.query(a.quadTreeRect, potentials)) continue

    for (const { data: b } of potentials) {
      if (b === a) continue

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
  const renderStartTime = performance.now()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < state.shapes.length; i++) {
    const shape = state.shapes[i]
    shape.render(ctx)
    if (state.options.renderPolyBounds && shape.vertices.length !== 4)
      shape.renderBounds(ctx)
  }

  if (state.options.renderQuadTree) quadTree.render(ctx)

  ctx.fillStyle = "yellow"
  ctx.fillText(
    `${state.shapes.length} polygons`,
    window.innerWidth - 80,
    window.innerHeight - 45
  )
  ctx.fillText(
    `update: ${dt}ms`,
    window.innerWidth - 80,
    window.innerHeight - 30
  )
  ctx.fillText(
    `render: ${performance.now() - renderStartTime}ms`,
    window.innerWidth - 80,
    window.innerHeight - 15
  )
}

import "./style.css"
import { SAT } from "./collisions"
import { createPolygon, Polygon } from "./polygon"
import { keyMap, inputs } from "./inputs"
import { quadTree, TypedRectangle } from "./quadTree"
import { addPolygon, loadState, state } from "./state"
import { normalize } from "./math"
import { Vec2 } from "./vec"
const canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")

console.log("norm: (0, 0)", normalize(new Vec2(0, 0)))
console.log(
  "norm: (size, size)",
  normalize(new Vec2(window.innerWidth, window.innerHeight))
)
console.log(
  "norm: (size+512, size+512)",
  normalize(
    new Vec2(window.innerWidth, window.innerHeight).add(new Vec2(512, 512))
  )
)
//loadPrefab(state.prefab)
loadState(main)
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
    keyMap.get(event.key.toLowerCase())?.(main)
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
    addPolygon(createPolygon())
  }
  const frameStartTime = performance.now()
  update()
  quadTree.clear()
  let len = state.polygons.length
  while (len--) {
    quadTree.insert(state.polygons[len].quadTreeRect)
  }
  //const dt = Math.min(performance.now() - frameStartTime, 1000 / state.options.fps)
  //console.log(dt)
  render(performance.now() - frameStartTime)
}

//setupOptionsUI(main)

function update() {
  //cull offscreen polygons
  // updatePolygons((items: Polygon[]) => {
  //   return items.filter((s: Polygon) => {
  //     return (
  //       s.position.x < window.innerWidth + 100 &&
  //       s.position.x > -100 &&
  //       s.position.y < window.innerHeight + 100 &&
  //       s.position.y > -100
  //     )
  //   })
  // })

  updatePhysics()
  handleCollisions_QuadTree()
}
function updatePhysics() {
  for (let i = 0; i < state.polygons.length; i++) {
    const poly = state.polygons[i]
    poly.isColliding = false

    if (!poly.isStatic) {
      poly.rotateBy(poly.angularVelocity)

      // r-click blackhole
      if (inputs.m1) {
        const gravAngle = Math.atan2(
          inputs.mPos.y - poly.position.y,
          inputs.mPos.x - poly.position.x
        )
        const dist = poly.position.distance(inputs.mPos)
        const gravForce = dist / 100
        poly.velocity.x += Math.cos(gravAngle) * gravForce
        poly.velocity.y += Math.sin(gravAngle) * gravForce
      }

      poly.velocity.y += state.options.gravity // gravity

      poly.velocity = poly.velocity.multiply(0.935) // friction
      poly.angularVelocity = poly.angularVelocity * 0.4
      poly.position = poly.position.add(poly.velocity)
      poly.needsUpdate = true
    }
  }
}
// function handleCollisions() {
//   for (let i = 0; i < state.polygons.length; i++) {
//     const a = state.polygons[i]
//     for (let j = 0; j < state.polygons.length; j++) {
//       const b = state.polygons[j]

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
  for (let i = 0; i < state.polygons.length; i++) {
    const a = state.polygons[i]
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

  for (let i = 0; i < state.polygons.length; i++) {
    const poly = state.polygons[i]
    poly.render(ctx)
    if (state.options.renderPolyBounds && poly.vertices.length !== 4)
      poly.renderBounds(ctx)
  }

  if (state.options.renderQuadTree) quadTree.render(ctx)

  ctx.fillStyle = "orange"
  ctx.fillText(
    `${state.polygons.length} polygons`,
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

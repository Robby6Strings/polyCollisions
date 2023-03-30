import "./style.css"
import { SAT } from "./lib/SAT"
import { createPolygon, Polygon } from "./lib/polygon"
import { keyMap, inputs } from "./inputs"
import { quadTree } from "./lib/quadTree"
import { loadState, appState } from "./appState"
import { normalize } from "./lib/math"
import { Vec2 } from "./lib/vec"
import { Emitter } from "./lib/emitter"
const canvas = document.createElement("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.appendChild(canvas)
const ctx = canvas.getContext("2d")

appState.subscribe("main_creatingEmitter", "creatingEmitter", (newVal) => {
  if (!!newVal) return document.body.classList.add("creatingEmitter")
  document.body.classList.remove("creatingEmitter")
})

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
loadState(main)

//event listeners
{
  function toggleMouseInput(btn: number, val: boolean) {
    inputs[btn == 0 ? "m0" : "m1"] = val
  }

  canvas.addEventListener("click", () => {
    if (appState.state.creatingEmitter) {
      appState.update((state) => {
        return {
          ...state,
          emitters: [
            ...state.emitters,
            new Emitter(
              inputs.mPos.copy(),
              new Vec2(),
              state.options.spawnCooldown
            ),
          ],
        }
      })
    }
  })

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
  let newPolygons: Polygon[] = []
  if (!appState.state.creatingEmitter && inputs.m0) {
    newPolygons.push(createPolygon())
  }
  for (let i = 0; i < appState.state.emitters.length; i++) {
    const poly = appState.state.emitters[i].update(appState.state.options.fps)
    if (poly) newPolygons.push(poly)
  }
  if (newPolygons.length > 0) {
    appState.update((state) => {
      return {
        ...state,
        polygons: [...state.polygons, ...newPolygons],
      }
    })
  }

  const frameStartTime = performance.now()
  update()
  quadTree.clear()
  let len = appState.state.polygons.length
  while (len--) {
    quadTree.insert(appState.state.polygons[len].quadTreeRect)
  }
  //const dt = Math.min(performance.now() - frameStartTime, 1000 / state.options.fps)
  //console.log(dt)
  render(performance.now() - frameStartTime)
}

const cullOffscreen = (items: Polygon[]) => {
  return items.filter((s: Polygon) => {
    return (
      s.position.x < window.innerWidth + 100 &&
      s.position.x > -100 &&
      s.position.y < window.innerHeight + 100 &&
      s.position.y > -100
    )
  })
}

function update() {
  updatePhysics()
  handleCollisions()
  appState.update((state) => {
    return { ...state, polygons: cullOffscreen(state.polygons) }
  })
}

function updatePhysics() {
  for (let i = 0; i < appState.state.polygons.length; i++) {
    const poly = appState.state.polygons[i]
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

      poly.velocity.y += appState.state.options.gravity // gravity

      poly.velocity = poly.velocity.multiply(0.935) // friction
      poly.angularVelocity = poly.angularVelocity * 0.4

      poly.position = poly.position.add(poly.velocity)
      poly.needsUpdate = true
    }
  }
}
function handleCollisions() {
  for (let i = 0; i < appState.state.polygons.length; i++) {
    const a = appState.state.polygons[i]
    for (let j = 0; j < appState.state.polygons.length; j++) {
      const b = appState.state.polygons[j]

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
// function handleCollisions_QuadTree() {
//   for (let i = 0; i < appState.state.polygons.length; i++) {
//     const a = appState.state.polygons[i]
//     //if (a.isStatic) continue
//     const potentials: TypedRectangle<Polygon>[] = []
//     if (!quadTree.query(a.quadTreeRect, potentials)) continue

//     for (const { data: b } of potentials) {
//       if (b === a) continue

//       const collision = SAT.checkCollision(a, b)
//       if (collision) {
//         a.isColliding = true
//         b.isColliding = true
//         if (collision) SAT.resolveCollision(collision)
//       }
//     }
//   }
// }

function render(dt: number) {
  if (!ctx) return
  const renderStartTime = performance.now()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < appState.state.emitters.length; i++) {
    appState.state.emitters[i].render(ctx)
  }

  for (let i = 0; i < appState.state.polygons.length; i++) {
    const poly = appState.state.polygons[i]
    poly.render(ctx)
    if (appState.state.options.renderPolyBounds && poly.vertices.length !== 4)
      poly.renderBounds(ctx)
  }

  if (appState.state.options.renderQuadTree) quadTree.render(ctx)

  const { innerWidth: w, innerHeight: h } = window

  ctx.fillStyle = "orange"
  ctx.fillText(`${appState.state.polygons.length} polygons`, w - 80, h - 45)
  ctx.fillText(`update: ${dt}ms`, w - 80, h - 30)
  ctx.fillText(
    `render: ${performance.now() - renderStartTime}ms`,
    w - 80,
    h - 15
  )
}

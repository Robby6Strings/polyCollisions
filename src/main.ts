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
  new Vec2(-window.innerWidth / 2, -10),
  new Vec2(window.innerWidth / 2, -10),
  new Vec2(window.innerWidth / 2, 10),
  new Vec2(-window.innerWidth / 2, 10),
]

const shapes: Array<Polygon> = [
  new Polygon(new Vec2(120, 320), triangleVertices, Math.PI / 4),
  new Polygon(new Vec2(150, 350), hexagonVertices, Math.PI / 6),
  new Polygon(
    new Vec2(window.innerWidth / 2, window.innerHeight - 20),
    floorVertices
  ),
]
shapes[0].angularVelocity = 0.025
shapes[1].angularVelocity = 0.025
shapes[2].isStatic = true

function update() {
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i]
    shape.isColliding = false
    if (!shape.isStatic) {
      shape.rotateBy(shape.angularVelocity)
      //shape.velocity.y += 0.03
      //shape.position = shape.position.add(shape.velocity)
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
        //if (collision) SAT.resolveCollision(collision)
      }
    }
  }
}

function render() {
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < shapes.length; i++) {
    const vertices = shapes[i].getVertices()
    ctx.strokeStyle = shapes[i].isColliding ? "red" : "green"
    ctx.beginPath()
    ctx.moveTo(vertices[0].x, vertices[0].y)
    for (const vertex of vertices) {
      ctx.lineTo(vertex.x, vertex.y)
    }
    ctx.closePath()
    ctx.stroke()
  }
}

function tick() {
  update()
  render()
  requestAnimationFrame(tick)
}

tick()

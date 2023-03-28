import { setupOptionsUI } from "./html"
import { Polygon, IPolygon } from "./polygon"
import { getPolygons, getPrefabs, Prefab } from "./prefab"
export const state = {
  loopRef: -1,
  shapes: [] as Polygon[],
  options: {
    renderQuadTree: false,
    renderPolyBounds: true,
    renderPolyData: true,
    renderShapeBackgrounds: false,
    randomizeNumVertices: false,
    continuoslySpawn: false,
    gravity: 0.7,
    maxPolyVertices: 6,
    strokeWidth: 1.5,
    polySize: 20,
    fps: 60,
    prefab: getPrefabs(),
  },
}

export const setLoopRef = (num: number) => (state.loopRef = num)

export function updateShapes(fn: { (val: Polygon[]): Polygon[] }) {
  state.shapes = fn(state.shapes)
}

export function addShape(p: Polygon) {
  state.shapes.push(p)
}

export const saveState = () => {
  const serialized = {
    shapes: state.shapes.map((s) => s.serialize()),
    options: state.options,
  }
  localStorage.setItem("polySandbox", JSON.stringify(serialized))
}

export const loadState = (loopFn: { (): void }) => {
  let data = localStorage.getItem("polySandbox")
  if (!data) return
  let parsed = JSON.parse(data)

  if ("shapes" in parsed) {
    state.shapes = (parsed.shapes as IPolygon[]).map((s) =>
      Polygon.deserialize(s)
    )
  }
  if ("options" in parsed) {
    state.options = parsed.options
    setupOptionsUI(loopFn)
  }
}

export function loadPrefab(prefab: Prefab) {
  updateShapes(() => [])
  state.shapes = getPolygons(prefab)
}

//setupOptionsUI()

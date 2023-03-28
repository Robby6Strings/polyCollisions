import { setupOptionsUI } from "./html"
import { Polygon, IPolygon } from "./polygon"
import { getPrefabCreator, getPrefabs, Prefab } from "./prefab"

const defaultOptions = {
  renderQuadTree: false,
  renderPolyBounds: true,
  renderPolyData: true,
  renderShapeBackgrounds: false,
  randomizeNumVertices: false,
  gravity: 0.7,
  maxPolyVertices: 6,
  strokeWidth: 1.5,
  polySize: 20,
  fps: 60,
  prefab: getPrefabs(),
}

export const state = {
  loopRef: -1,
  shapes: [] as Polygon[],
  options: { ...defaultOptions },
  prefab: Prefab.Default,
}

export type optionKey = keyof typeof defaultOptions

export const optionGroups = {
  Rendering: [
    "renderQuadTree",
    "renderPolyBounds",
    "renderPolyData",
    "renderShapeBackgrounds",
    "strokeWidth",
  ],
  Polygons: ["maxPolyVertices", "polySize", "prefab", "randomizeNumVertices"],
  Physics: ["gravity", "fps"],
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
    prefab: state.prefab,
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
  if ("prefab" in parsed) {
    state.prefab = parsed.prefab
  }
  if ("options" in parsed) {
    state.options = parsed.options
    setupOptionsUI(loopFn)
  }
}

export const resetOptions = () => (state.options = { ...defaultOptions })

export function loadPrefab(prefab: Prefab) {
  updateShapes(() => [])
  state.prefab = prefab
  state.shapes = getPrefabCreator(state.prefab)()
}
export const reloadPrefab = () => {
  updateShapes(() => [])
  state.shapes = getPrefabCreator(state.prefab)()
}

//setupOptionsUI()

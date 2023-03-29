import { setupOptionsUI } from "./ui/optionsUi"
import { Polygon, IPolygon } from "./polygon"
import { getPrefabCreator, getPrefabs, Prefab } from "./prefab"

export const defaultOptions = {
  renderQuadTree: false,
  renderPolyBounds: false,
  renderPolyData: false,
  renderPolyBackgrounds: false,
  randomizeNumVertices: false,
  gravity: 0.7,
  maxPolyVertices: 6,
  strokeWidth: 2,
  polySize: 20,
  fps: 60,
  prefab: getPrefabs(),
}

export const state = {
  loopRef: -1,
  polygons: [] as Polygon[],
  options: { ...defaultOptions },
  prefab: Prefab.Default,
}

export type optionKey = keyof typeof defaultOptions
export type stateKey = "prefab"

export const optionGroups = {
  Rendering: [
    "renderQuadTree",
    "renderPolyBounds",
    "renderPolyData",
    "renderPolyBackgrounds",
    "strokeWidth",
  ],
  Polygons: ["maxPolyVertices", "polySize", "randomizeNumVertices"],
  Physics: ["gravity"],
}

export const setLoopRef = (num: number) => (state.loopRef = num)

export function updatePolygons(fn: { (val: Polygon[]): Polygon[] }) {
  state.polygons = fn(state.polygons)
}

export function addPolygon(p: Polygon) {
  state.polygons.push(p)
}

export const saveState = () => {
  const serialized = {
    polygons: state.polygons.map((s) => s.serialize()),
    options: state.options,
    prefab: state.prefab,
  }
  localStorage.setItem("polySandbox", JSON.stringify(serialized))
}
export const deleteState = () => {
  localStorage.removeItem("polySandbox")
  //loadPrefab(Prefab.Default)
}

export const loadState = (loopFn: { (): void }) => {
  let data = localStorage.getItem("polySandbox")
  if (data) {
    try {
      let parsed = JSON.parse(data)

      if ("polygons" in parsed) {
        state.polygons = (parsed.polygons as IPolygon[]).map((s) =>
          Polygon.deserialize(s)
        )
      }
      if ("prefab" in parsed) {
        state.prefab = parsed.prefab
      }
      if ("options" in parsed) {
        state.options = parsed.options
      }
    } catch (error) {
      console.log("loadState error - localStorage has been cleared.", {
        error,
        data,
      })
      deleteState()
    }
  } else {
    loadPrefab(Prefab.Default)
  }

  setupOptionsUI(loopFn)
}

export const resetOptions = () => (state.options = { ...defaultOptions })

export function loadPrefab(prefab: Prefab) {
  updatePolygons(() => [])
  state.prefab = prefab
  state.polygons = getPrefabCreator(state.prefab)()
}
export const reloadPrefab = () => {
  updatePolygons(() => [])
  state.polygons = getPrefabCreator(state.prefab)()
}

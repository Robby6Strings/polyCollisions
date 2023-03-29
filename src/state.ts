import { setupOptionsUI } from "./ui/optionsUi"
import { Polygon, IPolygon } from "./polygon"
import { getPrefabCreator, getPrefabs, Prefab } from "./prefab"
import { Emitter, IEmitter } from "./emitter"

export const defaultOptions = {
  renderQuadTree: false,
  renderPolyBounds: false,
  renderPolyData: false,
  renderPolyBackgrounds: false,
  randomizeNumVertices: true,
  gravity: 0.7,
  maxPolyVertices: 6,
  strokeWidth: 2,
  polySize: 16,
  fps: 60,
  prefab: getPrefabs(),
}

export const state = {
  loopRef: -1,
  polygons: [] as Polygon[],
  emitters: [] as Emitter[],
  options: { ...defaultOptions },
  prefab: Prefab.Default,
  creatingEmitter: false,
}

export const setState = (val: { (s: typeof state): typeof state }) => {
  Object.assign(state, val(state))
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

export function addPolygon(p: Polygon | null) {
  if (!p) return
  state.polygons.push(p)
}

export const saveState = () => {
  const serialized = {
    polygons: state.polygons.map((s) => s.serialize()),
    emitters: state.emitters.map((e) => e.serialize()),
    options: state.options,
    prefab: state.prefab,
  }
  localStorage.setItem("polySandbox", JSON.stringify(serialized))
}
export const deleteState = () => localStorage.removeItem("polySandbox")

export const loadState = (loopFn: { (): void }) => {
  let data = localStorage.getItem("polySandbox")
  if (data) {
    try {
      let parsed = JSON.parse(data)
      setState((state) => {
        return {
          ...state,
          polygons: (parsed.polygons ?? ([] as IPolygon[])).map((s: IPolygon) =>
            Polygon.deserialize(s)
          ),
          emitters: (parsed.emitters ?? ([] as IEmitter[])).map((e: IEmitter) =>
            Emitter.deserialize(e)
          ),
          prefab: parsed.prefab ?? Prefab.Default,
          options: parsed.options ?? { ...defaultOptions },
        }
      })
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
  setState((state) => Object.assign(state, { prefab }))
  reloadPrefab()
}
export const reloadPrefab = () => {
  const { polygons, emitters } = getPrefabCreator(state.prefab)()
  setState((state) => {
    return { ...state, polygons, emitters: emitters ?? [] }
  })
}

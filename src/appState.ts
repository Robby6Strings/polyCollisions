import { setupOptionsUI } from "./optionsUi"
import { Polygon, IPolygon } from "./lib/polygon"
import { getPrefabCreator, getPrefabs, Prefab } from "./lib/prefab"
import { Emitter, IEmitter } from "./lib/emitter"
import { ObservableState } from "./lib/state"

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
  spawnCooldown: 450,
}
//export type optionKey = keyof typeof defaultOptions

const defaultState = {
  loopRef: -1,
  polygons: [] as Polygon[],
  emitters: [] as Emitter[],
  options: { ...defaultOptions },
  prefab: Prefab.Default,
  creatingEmitter: false,
}

export const optionGroups = {
  Rendering: [
    "renderQuadTree",
    "renderPolyBounds",
    "renderPolyData",
    "renderPolyBackgrounds",
    "strokeWidth",
  ],
  Polygons: [
    "maxPolyVertices",
    "polySize",
    "randomizeNumVertices",
    "spawnCooldown",
  ],
  Physics: ["gravity"],
}

export const appState = new ObservableState(defaultState)

export const saveState = () => {
  const { polygons, emitters, options, prefab } = appState.state
  const serialized = {
    polygons: polygons.map((s) => s.serialize()),
    emitters: emitters.map((e) => e.serialize()),
    options,
    prefab,
  }
  localStorage.setItem("polySandbox", JSON.stringify(serialized))
}
export const deleteState = () => localStorage.removeItem("polySandbox")

export const loadState = (loopFn: { (): void }) => {
  let data = localStorage.getItem("polySandbox")
  if (data) {
    try {
      let parsed = JSON.parse(data)
      appState.update((state) => {
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

export const resetOptions = () => {
  appState.update((values) => {
    return { ...values, options: { ...defaultOptions } }
  })
}

export function loadPrefab(prefab: Prefab) {
  appState.update((values) => Object.assign(values, { prefab }))
  reloadPrefab()
}
export const reloadPrefab = () => {
  const { polygons, emitters } = getPrefabCreator(appState.state.prefab)()
  appState.update((values) => {
    return { ...values, polygons, emitters: emitters ?? [] }
  })
}

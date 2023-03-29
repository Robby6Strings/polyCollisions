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
  spawnCooldown: 450,
}
export type optionKey = keyof typeof defaultOptions

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

export type observerCallback = { (newValue: any): any }
const stateObservers: Map<string, Map<string, observerCallback>> = new Map()

const _state = {
  loopRef: -1,
  polygons: [] as Polygon[],
  emitters: [] as Emitter[],
  options: { ...defaultOptions },
  prefab: Prefab.Default,
  creatingEmitter: false,
}

export type stateKey = "prefab" | "creatingEmitter"

export const state = new Proxy(_state, {
  set: function (target, prop, value) {
    if (state[prop as stateKey] !== value) {
      stateObservers
        .get(prop as stateKey)
        ?.forEach((callback) => callback(value))
    }
    return Reflect.set(target, prop, value)
  },
})

export const subscribe = (
  originKey: string,
  stateKey: keyof typeof state,
  callback: observerCallback
) => {
  const keyObservers = stateObservers.get(stateKey)
  if (keyObservers) {
    keyObservers.set(originKey, callback)
    return
  }
  const newMap: Map<string, observerCallback> = new Map()
  newMap.set(originKey, callback)
  stateObservers.set(stateKey, newMap)
}
export const unsubscribe = (
  originKey: string,
  stateKey: keyof typeof state
) => {
  const keyObservers = stateObservers.get(stateKey)
  if (!keyObservers) return
  keyObservers.delete(originKey)
}
export const setState = (val: { (s: typeof state): typeof state }) => {
  Object.assign(state, val(state))
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

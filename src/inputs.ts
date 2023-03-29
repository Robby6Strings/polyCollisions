import { setupOptionsUI } from "./ui/optionsUi"
import {
  deleteState,
  loadState,
  reloadPrefab,
  resetOptions,
  saveState,
  setState,
} from "./state"
import { Vec2 } from "./vec"

export const inputs = {
  m0: false,
  m1: false,
  mPos: new Vec2(),
}

type keyMap = Map<string, (loopFn: { (): void }) => void>

export const keyMap: keyMap = new Map([
  ["l", (loopFn: { (): void }) => loadState(loopFn)],
  ["s", () => saveState()],
  ["r", () => reloadPrefab()],
  ["d", () => deleteState()],
  [
    "o",
    (loopFn: { (): void }) => {
      resetOptions()
      setupOptionsUI(loopFn)
    },
  ],
  [
    "e",
    () => {
      setState((s) => {
        return { ...s, creatingEmitter: true }
      })
    },
  ],
  [
    "c",
    () => {
      setState((s) => {
        return { ...s, polygons: [] }
      })
    },
  ],
  [
    "escape",
    () => {
      const el = document.querySelector(".options-wrapper")
      if (el) el.classList.toggle("expanded")
    },
  ],
])

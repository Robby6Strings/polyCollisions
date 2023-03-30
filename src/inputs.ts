import { setupOptionsUI } from "./optionsUi"
import {
  deleteState,
  loadState,
  reloadPrefab,
  resetOptions,
  saveState,
  appState,
} from "./appState"
import { Vec2 } from "./lib/vec"

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
      appState.update((s) => {
        return { ...s, creatingEmitter: !s.creatingEmitter }
      })
    },
  ],
  [
    "c",
    () => {
      appState.update((s) => {
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

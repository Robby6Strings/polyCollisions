import { setupOptionsUI } from "./optionsUi"
import {
  deleteState,
  loadState,
  reloadPrefab,
  resetOptions,
  saveState,
  appState,
} from "./appState"

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
      appState.update((state) => ({ creatingEmitter: !state.creatingEmitter }))
    },
  ],
  [
    "c",
    () => {
      appState.update(() => ({ polygons: [] }))
    },
  ],
  [
    "escape",
    () => {
      document.querySelector(".options-wrapper")?.classList.toggle("expanded")
    },
  ],
])

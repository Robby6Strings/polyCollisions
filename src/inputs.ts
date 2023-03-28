import { loadState, reloadPrefab, saveState } from "./state"
import { Vec2 } from "./vec"

export const inputs = {
  m0: false,
  m1: false,
  mPos: new Vec2(),
}

export const keyMap: Map<string, (loopFn: { (): void }) => void> = new Map([
  ["l", (loopFn: { (): void }) => loadState(loopFn)],
  ["s", () => saveState()],
  [
    "Escape",
    () => {
      const el = document.querySelector(".options-wrapper")
      if (el) el.classList.toggle("expanded")
    },
  ],
  ["r", () => reloadPrefab()],
])

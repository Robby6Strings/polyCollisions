import { updateShapes, saveState, loadState, state, setLoopRef } from "./state"

function createOptionElement(optionKey: string, val: any): HTMLElement {
  const el = Object.assign(document.createElement("input"), {
    id: optionKey,
    type: typeof val === "boolean" ? "checkbox" : "number",
    [typeof val === "boolean" ? "checked" : "value"]: val,
    onchange: () => {
      Object.assign(state.options, {
        [optionKey]: typeof val === "boolean" ? el.checked : el.value,
      })
    },
  })

  const lbl = document.createElement("label")
  lbl.innerText = optionKey
  lbl.htmlFor = el.id

  const wrapperEl = document.createElement("div")
  wrapperEl.className = "option"
  wrapperEl.append(el, lbl)

  return wrapperEl
}

let optsBox: HTMLElement | null

const eventEls: HTMLElement[] = []

export function setupOptionsUI(loopFn: { (): void }) {
  if (optsBox) {
    document.body.removeChild(optsBox)
  }
  optsBox = Object.assign(document.createElement("div"), {
    className: "options",
  })
  optsBox.append(
    ...Object.entries(state.options).map(([key, val]) =>
      createOptionElement(key, val)
    ),
    document.createElement("hr"),
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "Reset polygons",
      onclick: () => updateShapes(() => []),
    }),
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "Save State",
      onclick: () => {
        saveState()
      },
    }),
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "Load State",
      onclick: () => {
        loadState(loopFn)
      },
    })
  )
  const fpsOption = optsBox.querySelector("#fps")!
  fpsOption.addEventListener("change", () => {
    clearInterval(state.loopRef)
    setLoopRef(setInterval(loopFn, 1000 / state.options.fps))
  })

  clearInterval(state.loopRef)
  setLoopRef(setInterval(loopFn, 1000 / state.options.fps))

  document.body.appendChild(optsBox)
}

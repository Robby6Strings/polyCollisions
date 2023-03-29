import { Rendr } from "./rendr"
import { strToPrefab } from "./prefab"
import {
  updatePolygons,
  saveState,
  loadState,
  state,
  setLoopRef,
  loadPrefab,
  optionGroups,
  optionKey,
  resetOptions,
  reloadPrefab,
  defaultOptions,
  deleteState,
} from "./state"

let optsBox: HTMLElement | null

const { element, div, button, select, input, resetEventHandlers } = Rendr

function createOptionGroup(groupName: string, optionKeys: optionKey[]) {
  return div("option-group", [
    element("h5", { innerText: groupName }),
    element("hr"),
    div(
      "option-group-items",
      optionKeys.map((optionKey) => createOption(optionKey))
    ),
  ])
}

function createOption(optionKey: optionKey): HTMLElement {
  const val = state.options[optionKey]
  return div("option", [
    element("label", {
      innerText: optionKey,
      htmlFor: optionKey,
    }),
    Array.isArray(val)
      ? select(optionKey, val, {
          onChange: (el) => {
            Object.assign(state.options, {
              [optionKey]: el.value,
            })
          },
        })
      : input(optionKey, val, {
          onChange: (el) => {
            Object.assign(state.options, {
              [optionKey]:
                typeof val === "boolean" ? el.checked : parseFloat(el.value),
            })
          },
          onCreated: (el) => {
            const type = Rendr.getInputType(val)
            if (type === "number") {
              const defaultVal = defaultOptions[optionKey]
              el.setAttribute(
                "step",
                defaultVal.toString().indexOf(".") > -1 ? "0.1" : "1"
              )
            }
          },
        }),
  ])
}

export function setupOptionsUI(loopFn: { (): void }) {
  resetEventHandlers()

  if (optsBox) document.body.removeChild(optsBox)

  const handle = div("handle", [
    button("=", () => {
      document.querySelector(".options-wrapper")?.classList.toggle("expanded")
    }),
  ])

  optsBox = div("options-wrapper expanded", [
    handle,
    div("options", [
      ...Object.entries(optionGroups).map(([key, val]) =>
        createOptionGroup(key, val as optionKey[])
      ),
      div("option-group", [
        div("option-group-items", [
          div("option", [
            element("label", { innerText: "Prefab" }),
            select("prefab", state.options.prefab, {
              onCreated: (el: HTMLSelectElement) => {
                el.value = state.prefab
              },
              onChange: (el) => {
                updatePolygons(() => [])
                loadPrefab(strToPrefab(el.value))
              },
            }),
          ]),
          div("option", [
            element("label", { innerText: "fps" }),
            input("fps", state.options.fps, {
              onChange: (el) => {
                state.options.fps = parseInt(el.value)
                clearInterval(state.loopRef)
                setLoopRef(setInterval(loopFn, 1000 / state.options.fps))
              },
            }),
          ]),
        ]),
      ]),

      div("buttons", [
        button("Reload Polygon Prefab [R]", () => reloadPrefab()),
        button("Clear Polygons [C]", () => updatePolygons(() => [])),
        button("Reset Options [O]", () => {
          resetOptions()
          setupOptionsUI(loopFn)
        }),
        button("Save State [S]", () => saveState()),
        button("Load State [L]", () => loadState(loopFn)),
        button("Delete Save [D]", () => deleteState()),
      ]),
    ]),
  ])

  clearInterval(state.loopRef)
  setLoopRef(setInterval(loopFn, 1000 / state.options.fps))

  document.body.appendChild(optsBox)
}

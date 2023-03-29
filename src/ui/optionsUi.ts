import { ElementEventProps, GenericEventProps, Rendr } from "./rendr"
import { Prefab, strToPrefab } from "../prefab"
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
} from "../state"

let optsBox: HTMLElement | null

const { element, div, button, select, input, resetEventHandlers } = Rendr

function createOptionGroup(
  groupName: string,
  optionKeys: optionKey[],
  events: GenericEventProps = {}
) {
  return div("option-group", [
    element("h5", { innerText: groupName }),
    element("hr"),
    div(
      "option-group-items",
      optionKeys.map((optionKey) =>
        createOption(optionKey, state.options[optionKey], events)
      )
    ),
  ])
}

function createOption(
  key: optionKey,
  val: number | boolean | Prefab[],
  events: GenericEventProps = {}
): HTMLElement {
  const onChange = events.onChange
    ? events.onChange
    : (el: HTMLElement) => {
        Object.assign(state.options, {
          [key]: Array.isArray(val)
            ? (el as HTMLSelectElement).value
            : typeof val === "boolean"
            ? (el as HTMLInputElement).checked
            : parseFloat((el as HTMLInputElement).value),
        })
      }

  const onCreated = events.onCreated
    ? events.onCreated
    : (el: HTMLElement) => {
        const type = Rendr.getInputType(val)
        if (type === "number") {
          const defaultVal = defaultOptions[key]
          el.setAttribute(
            "step",
            defaultVal.toString().indexOf(".") > -1 ? "0.1" : "1"
          )
        }
      }

  return div("option", [
    element("label", {
      innerText: key,
      htmlFor: key,
    }),
    Array.isArray(val)
      ? select(key, val, {
          onChange,
          onCreated,
        })
      : input(key, val, {
          onChange,
          onCreated,
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
          createOption("prefab", state.options.prefab, {
            onCreated: (el) => ((el as HTMLSelectElement).value = state.prefab),
            onChange: (el) => {
              updatePolygons(() => [])
              loadPrefab(strToPrefab((el as HTMLSelectElement).value))
            },
          }),
          createOption("fps", state.options.fps, {
            onChange: (el) => {
              state.options.fps = parseInt((el as HTMLInputElement).value)
              clearInterval(state.loopRef)
              setLoopRef(setInterval(loopFn, 1000 / state.options.fps))
            },
          }),
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

import { Rendr } from "../lib/rendr"
import {
  appState,
  saveState,
  loadState,
  optionGroups,
  resetOptions,
  reloadPrefab,
  deleteState,
} from "../appState"
import { optionGroup } from "./components/option"
import { prefabSelector } from "./components/prefabSelector"
import { fpsController } from "./components/fpsController"
import { generateUUID } from "../lib/math"

const { div, button, element } = Rendr

let optsBox: HTMLElement | null

const buttons = (loopFn: { (): void }) => {
  return div("buttons", [
    button("Reload Polygon Prefab [R]", {
      onClick: () => reloadPrefab(),
    }),
    button("Clear Polygons [C]", {
      onClick: () => appState.update(() => ({ polygons: [] })),
    }),
    button("Reset Options [O]", {
      onClick: () => {
        resetOptions()
        setupOptionsUI(loopFn)
      },
    }),
    button("Save State [S]", { onClick: () => saveState() }),
    button("Load State [L]", { onClick: () => loadState(loopFn) }),
    button("Delete Save [D]", { onClick: () => deleteState() }),
    button("Create Emitter [E]", {
      id: generateUUID(),
      computedProps: (props: Rendr.ElementProps<HTMLButtonElement>) =>
        Object.assign(
          { className: appState.state.creatingEmitter ? "active" : "" },
          props
        ),

      onClick: () => {
        appState.update(({ creatingEmitter }) => ({
          creatingEmitter: !creatingEmitter,
        }))
      },
      onCreated: (el) => {
        appState.subscribe(el.id, "creatingEmitter", (newVal) => {
          el.className = newVal ? "active" : ""
        })
      },
      onDestroyed: ({ id }) => appState.unsubscribe(id, "creatingEmitter"),
    }),

    element("div", {
      id: generateUUID(),
      computedProps: (props: Rendr.ElementProps<HTMLDivElement>) =>
        Object.assign({ innerText: appState.state.creatingEmitter }, props),

      onCreated: (el, creator) =>
        appState.subscribe(el.id, "creatingEmitter", (newVal: boolean) =>
          el.replaceWith(
            creator({
              innerText: newVal,
              children: newVal
                ? [
                    element("p", { innerText: "child" }),
                    element("p", { innerText: "child" }),
                  ]
                : [],
            })
          )
        ),

      onDestroyed: ({ id }) => appState.unsubscribe(id, "creatingEmitter"),
    }),
  ])
}

export function setupOptionsUI(loopFn: { (): void }) {
  Rendr.resetEventHandlers()
  Rendr.resetSubscriptions()

  if (optsBox) document.body.removeChild(optsBox)

  optsBox = div("options-wrapper expanded", [
    div("handle", [
      button("=", {
        onClick: () => optsBox?.classList.toggle("expanded"),
      }),
    ]),
    div("options", [
      div("option-group", [
        div("option-group-items", [prefabSelector(), fpsController(loopFn)]),
      ]),
      ...Object.entries(optionGroups).map(([key, val]) =>
        optionGroup(key, val)
      ),
      div("option-group", [buttons(loopFn)]),
    ]),
  ])

  clearInterval(appState.state.loopRef)
  appState.update(({ options }) => ({
    loopRef: setInterval(loopFn, 1000 / options.fps),
  }))

  document.body.appendChild(optsBox)
}

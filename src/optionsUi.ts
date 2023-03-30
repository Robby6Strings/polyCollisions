import { Rendr } from "./lib/rendr"
import { Prefab, strToPrefab } from "./lib/prefab"
import {
  appState,
  saveState,
  loadState,
  loadPrefab,
  optionGroups,
  resetOptions,
  reloadPrefab,
  defaultOptions,
  deleteState,
} from "./appState"

let optsBox: HTMLElement | null

const {
  element,
  div,
  button,
  select,
  input,
  resetEventHandlers,
  resetElementSubscriptions,
} = Rendr

function createOptionGroup(
  groupName: string,
  optionKeys: string[],
  events: Rendr.ElementEventProps<HTMLElement> = {}
) {
  return div("option-group", [
    element("h5", { innerText: groupName }),
    element("hr"),
    div(
      "option-group-items",
      optionKeys.map((optionKey) =>
        createOption(
          optionKey,
          appState.state.options[
            optionKey as keyof typeof appState.state.options
          ],
          events
        )
      )
    ),
  ])
}

function createOption(
  key: string,
  val: number | boolean | Prefab[],
  events: Rendr.ElementEventProps<HTMLSelectElement | HTMLInputElement> = {}
): HTMLDivElement {
  const onChange = events.onChange
    ? events.onChange
    : (el: HTMLSelectElement | HTMLInputElement) => {
        appState.update(({ options }) => ({
          options: {
            ...options,
            [key]: Array.isArray(val)
              ? (el as HTMLSelectElement).value
              : typeof val === "boolean"
              ? (el as HTMLInputElement).checked
              : parseFloat((el as HTMLInputElement).value),
          },
        }))
      }

  const onCreated = events.onCreated
    ? events.onCreated
    : (el: HTMLSelectElement | HTMLInputElement) => {
        const type = Rendr.getInputType(val)
        if (type === "number") {
          const defaultVal = defaultOptions[key as keyof typeof defaultOptions]
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

const createButtons = (loopFn: { (): void }) => {
  return div("buttons", [
    button("Reload Polygon Prefab [R]", { onClick: () => reloadPrefab() }),
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
      className: appState.state.creatingEmitter ? "active" : "",
      onClick: () => {
        appState.update(({ creatingEmitter }) => ({
          creatingEmitter: !creatingEmitter,
        }))
      },
      watch: {
        state: appState,
        property: "creatingEmitter",
        callback: (el, newVal) => (el.className = newVal ? "active" : ""),
      },
    }),
  ])
}

const createFpsController = (loopFn: { (): void }) =>
  createOption("fps", appState.state.options.fps, {
    onChange: (el) => {
      clearInterval(appState.state.loopRef)
      const fps = parseInt(el.value)
      appState.update(({ options }) => ({
        loopRef: setInterval(loopFn, 1000 / fps),
        options: { ...options, fps },
      }))
    },
  })

const createPrefabSelector = () =>
  createOption("prefab", appState.state.options.prefab, {
    onCreated: (el) => (el.value = appState.state.prefab),
    onChange: (el) => {
      appState.update(() => ({ polygons: [] }))
      loadPrefab(strToPrefab(el.value))
    },
  })

export function setupOptionsUI(loopFn: { (): void }) {
  resetEventHandlers()
  resetElementSubscriptions()

  if (optsBox) document.body.removeChild(optsBox)

  optsBox = div("options-wrapper expanded", [
    div("handle", [
      button("=", {
        onClick: () => optsBox?.classList.toggle("expanded"),
      }),
    ]),
    div("options", [
      div("option-group", [
        div("option-group-items", [
          createPrefabSelector(),
          createFpsController(loopFn),
        ]),
      ]),
      ...Object.entries(optionGroups).map(([key, val]) =>
        createOptionGroup(key, val)
      ),
      div("option-group", [createButtons(loopFn)]),
    ]),
  ])

  clearInterval(appState.state.loopRef)
  appState.update(({ options }) => ({
    loopRef: setInterval(loopFn, 1000 / options.fps),
  }))

  document.body.appendChild(optsBox)
}

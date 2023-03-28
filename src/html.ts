import { strToPrefab } from "./prefab"
import {
  updateShapes,
  saveState,
  loadState,
  state,
  setLoopRef,
  loadPrefab,
  optionGroups,
  optionKey,
  resetOptions,
  reloadPrefab,
} from "./state"

let optsBox: HTMLElement | null

type EventHandlerRef = {
  element: HTMLElement
  callback: { (e: Event): any }
}
const eventHandlerRefs: EventHandlerRef[] = []

function getInputType(val: any): string {
  switch (typeof val) {
    case "boolean":
      return "checkbox"
    case "number":
      return "number"
    case "string":
      return "text"
  }
  throw new Error("unable to get input type for val with type: " + typeof val)
}
function createOptionGroup(groupName: string, optionKeys: optionKey[]) {
  const wrapper = document.createElement("div")
  wrapper.className = "option-group"
  const itemsContainer = document.createElement("div")
  itemsContainer.className = "option-group-items"
  itemsContainer.append(
    ...optionKeys.map((optionKey) => createOptionElement(optionKey))
  )
  wrapper.append(
    Object.assign(document.createElement("h5"), { innerText: groupName }),
    document.createElement("hr"),
    itemsContainer
  )
  return wrapper
}
function createOptionElement(optionKey: optionKey): HTMLElement {
  const val: any = state.options[optionKey]
  let el: HTMLElement
  const wrapperEl = document.createElement("div")
  wrapperEl.className = "option"

  if (Array.isArray(val)) {
    el = document.createElement("select")
    el.id = optionKey
    el.append(
      ...val.map((item) => {
        return Object.assign(document.createElement("option"), {
          value: item,
          text: item,
        })
      })
    )
    if (optionKey in state) {
      //@ts-ignore
      ;(el as HTMLSelectElement).value = state[optionKey]
    }
  } else {
    const type = getInputType(val)
    el = Object.assign(document.createElement("input"), {
      type,
      id: optionKey,
      [typeof val === "boolean" ? "checked" : "value"]: val,
      onchange: () => {
        Object.assign(state.options, {
          [optionKey]:
            typeof val === "boolean"
              ? (el as HTMLInputElement).checked
              : (el as HTMLInputElement).value,
        })
      },
    })
    if (type === "number") el.setAttribute("step", "0.1")
  }

  const lbl = document.createElement("label")
  lbl.innerText = optionKey
  lbl.htmlFor = el.id

  wrapperEl.append(lbl, el)

  return wrapperEl
}

function registerEventHandler<T extends HTMLElement>(
  elQuerySelector: string,
  callback: { (e: Event): void }
) {
  const element = optsBox?.querySelector<T>(elQuerySelector)
  if (!element)
    throw new Error(
      "unable to get options element with querySelector: " + elQuerySelector
    )
  element.addEventListener("change", callback)
  eventHandlerRefs.push({
    element,
    callback,
  })
}
function resetEventHandlers() {
  while (eventHandlerRefs.length > 0) {
    const item = eventHandlerRefs.pop()!
    item.element.removeEventListener("change", item?.callback)
  }
}

export function setupOptionsUI(loopFn: { (): void }) {
  resetEventHandlers()

  if (optsBox) document.body.removeChild(optsBox)

  optsBox = Object.assign(document.createElement("div"), {
    className: "options-wrapper expanded",
  })

  const inner = Object.assign(document.createElement("div"), {
    className: "options",
  })
  inner.append(
    ...Object.entries(optionGroups).map(([key, val]) =>
      createOptionGroup(key, val as optionKey[])
    ),
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "Reload Polygon Prefab",
      onclick: () => {
        reloadPrefab()
      },
    }),
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "Clear Polygons",
      onclick: () => updateShapes(() => []),
    }),
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "Reset Options",
      onclick: () => {
        resetOptions()
        setupOptionsUI(loopFn)
      },
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

  const handle = Object.assign(document.createElement("div"), {
    className: "handle",
  })
  handle.appendChild(
    Object.assign(document.createElement("button"), {
      type: "button",
      innerText: "=",
      onclick: () => {
        document.querySelector(".options-wrapper")?.classList.toggle("expanded")
      },
    })
  )
  optsBox.append(handle, inner)

  registerEventHandler<HTMLInputElement>("#fps", (_: Event) => {
    clearInterval(state.loopRef)
    setLoopRef(setInterval(loopFn, 1000 / state.options.fps))
  })

  registerEventHandler<HTMLSelectElement>("#prefab", (e: Event) => {
    updateShapes(() => [])
    loadPrefab(strToPrefab((e.target as HTMLSelectElement).value))
  })

  clearInterval(state.loopRef)
  setLoopRef(setInterval(loopFn, 1000 / state.options.fps))

  document.body.appendChild(optsBox)
}

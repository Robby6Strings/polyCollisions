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
  stateKey,
} from "./state"

let optsBox: HTMLElement | null

type EventHandlerRef = {
  element: HTMLElement
  callback: { (e: Event): any }
}
type HtmlGUIValue = number | boolean | string[]
type HtmlGuiProps<T> = {
  htmlFor?: string
  children?: HTMLElement[]
  onCreated?: { (el: T): void }
  [key: string]: any
}

const eventHandlerRefs: EventHandlerRef[] = []

class HtmlGUI {
  static getInputType(val: any): string {
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
  static registerEventHandler<T extends HTMLElement>(
    querySelector: string,
    callback: { (e: Event): void }
  ) {
    const element = optsBox?.querySelector<T>(querySelector)
    if (!element)
      throw new Error(
        "unable to get options element with querySelector: " + querySelector
      )
    element.addEventListener("change", callback)
    eventHandlerRefs.push({
      element,
      callback,
    })
  }

  static resetEventHandlers() {
    while (eventHandlerRefs.length > 0) {
      const item = eventHandlerRefs.pop()
      item?.element.removeEventListener("change", item.callback)
    }
  }

  static createElement<T extends HTMLElement>(
    tag: string,
    props: HtmlGuiProps<T> = {}
  ): T {
    const { htmlFor, children, onCreated, ...rest } = props
    const el = Object.assign(document.createElement(tag), rest) as T
    if (children) el.append(...children)
    if (htmlFor && "htmlFor" in el) el.htmlFor = htmlFor
    if (onCreated) onCreated(el)
    return el
  }

  static createSelect(optionKey: optionKey, val: string[]): HTMLSelectElement {
    return HtmlGUI.createElement<HTMLSelectElement>("select", {
      id: optionKey,
      children: val.map((item: string) => {
        return HtmlGUI.createElement("option", {
          value: item,
          text: item,
        })
      }),
      onCreated: (el) => {
        if (optionKey in state) el.value = state[optionKey as stateKey]
      },
    })
  }
  static createInput(
    optionKey: optionKey,
    val: boolean | number
  ): HTMLInputElement {
    const defaultVal = defaultOptions[optionKey]
    const type = HtmlGUI.getInputType(val)
    return HtmlGUI.createElement<HTMLInputElement>("input", {
      type,
      id: optionKey,
      [typeof defaultVal === "boolean" ? "checked" : "value"]: val,
      onchange: function () {
        Object.assign(state.options, {
          [optionKey]:
            typeof defaultVal === "boolean"
              ? this.checked
              : parseFloat(this.value),
        })
      },
      onCreated: (el) => {
        if (type === "number") {
          el.setAttribute(
            "step",
            defaultVal.toString().indexOf(".") > -1 ? "0.1" : "1"
          )
        }
      },
    })
  }
}

function createOptionGroup(groupName: string, optionKeys: optionKey[]) {
  return HtmlGUI.createElement("div", {
    className: "option-group",
    children: [
      HtmlGUI.createElement("h5", { innerText: groupName }),
      HtmlGUI.createElement("hr"),
      HtmlGUI.createElement("div", {
        className: "option-group-items",
        children: optionKeys.map((optionKey) => createOptionElement(optionKey)),
      }),
    ],
  })
}

function createOptionElement(optionKey: optionKey): HTMLElement {
  const val: HtmlGUIValue = state.options[optionKey]

  return HtmlGUI.createElement("div", {
    className: "option",
    children: [
      HtmlGUI.createElement("label", {
        innerText: optionKey,
        htmlFor: optionKey,
      }),
      Array.isArray(val)
        ? HtmlGUI.createSelect(optionKey, val)
        : HtmlGUI.createInput(optionKey, val),
    ],
  })
}

export function setupOptionsUI(loopFn: { (): void }) {
  HtmlGUI.resetEventHandlers()

  if (optsBox) document.body.removeChild(optsBox)

  const handle = HtmlGUI.createElement<HTMLDivElement>("div", {
    className: "handle",
    children: [
      HtmlGUI.createElement("button", {
        type: "button",
        innerText: "=",
        onclick: () => {
          document
            .querySelector(".options-wrapper")
            ?.classList.toggle("expanded")
        },
      }),
    ],
  })

  optsBox = HtmlGUI.createElement("div", {
    className: "options-wrapper expanded",
    children: [
      handle,
      HtmlGUI.createElement("div", {
        className: "options",
        children: [
          ...Object.entries(optionGroups).map(([key, val]) =>
            createOptionGroup(key, val as optionKey[])
          ),
          HtmlGUI.createElement("div", {
            className: "buttons",
            children: [
              HtmlGUI.createElement("button", {
                type: "button",
                innerText: "Reload Polygon Prefab [R]",
                onclick: () => {
                  reloadPrefab()
                },
              }),
              HtmlGUI.createElement("button", {
                type: "button",
                innerText: "Clear Polygons [C]",
                onclick: () => updatePolygons(() => []),
              }),
              HtmlGUI.createElement("button", {
                type: "button",
                innerText: "Reset Options [O]",
                onclick: () => {
                  resetOptions()
                  setupOptionsUI(loopFn)
                },
              }),
              HtmlGUI.createElement("button", {
                type: "button",
                innerText: "Save State [S]",
                onclick: () => {
                  saveState()
                },
              }),
              HtmlGUI.createElement("button", {
                type: "button",
                innerText: "Load State [L]",
                onclick: () => {
                  loadState(loopFn)
                },
              }),
              HtmlGUI.createElement("button", {
                type: "button",
                innerText: "Delete Save [D]",
                onclick: () => {
                  deleteState()
                },
              }),
            ],
          }),
        ],
      }),
    ],
  })

  HtmlGUI.registerEventHandler<HTMLInputElement>("#fps", (_: Event) => {
    clearInterval(state.loopRef)
    setLoopRef(setInterval(loopFn, 1000 / state.options.fps))
  })

  HtmlGUI.registerEventHandler<HTMLSelectElement>("#prefab", (e: Event) => {
    updatePolygons(() => [])
    loadPrefab(strToPrefab((e.target as HTMLSelectElement).value))
  })

  clearInterval(state.loopRef)
  setLoopRef(setInterval(loopFn, 1000 / state.options.fps))

  document.body.appendChild(optsBox)
}

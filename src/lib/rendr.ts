import { generateUUID } from "./math"
import { IState } from "./state"

export namespace Rendr {
  const eventHandlerRefs: EventHandlerRef[] = []
  const elementSubscriptions: WatchedElementRef[] = []

  type ReactivityConfig = {
    state: IState
    property: string
    callback: { (el: HTMLElement, newVal: any): void }
  }

  type EventHandlerRef = {
    element: HTMLElement
    callback: { (e: Event): any }
  }

  type WatchedElementRef = {
    element: HTMLElement
    onDestroyed: { (): void }
  }

  export type ElementEventProps<T> = {
    onCreated?: { (el: T): void }
    onChange?: { (el: T): void }
    onClick?: { (el: T): void }
    onDestroyed?: { (el: T): void }
  }

  export type ElementProps<T> = ElementEventProps<T> & {
    className?: string
    htmlFor?: string
    children?: HTMLElement[]
    watch?: ReactivityConfig
    [key: string]: any
  }

  export function getInputType(val: any): string {
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

  export function registerEventHandler<T extends HTMLElement>(
    elementOrQuery: HTMLElement | string,
    callback: { (e: Event): void }
  ) {
    const element =
      typeof elementOrQuery === "string"
        ? document.querySelector<T>(elementOrQuery)!
        : elementOrQuery

    element.addEventListener("change", callback)
    eventHandlerRefs.push({
      element,
      callback,
    })
  }

  export function resetEventHandlers() {
    while (eventHandlerRefs.length > 0) {
      const { element, callback } = eventHandlerRefs.pop()!
      element.removeEventListener("change", callback)
    }
  }

  export function resetElementSubscriptions() {
    while (elementSubscriptions.length > 0) {
      elementSubscriptions.pop()?.onDestroyed()
    }
  }

  export function element<T extends HTMLElement>(
    tag: string,
    props: ElementProps<T> = {}
  ): T {
    const {
      htmlFor,
      children,
      onCreated,
      onChange,
      onClick,
      onDestroyed,
      watch,
      ...rest
    } = props

    const element = Object.assign(document.createElement(tag), rest) as T

    if (onChange) element.onchange = () => onChange(element)
    if (onClick) element.onclick = () => onClick(element)
    if (children) element.append(...children)
    if (htmlFor && "htmlFor" in element) element.htmlFor = htmlFor

    if (onDestroyed) {
      elementSubscriptions.push({
        element,
        onDestroyed: () => {
          onDestroyed(element)
        },
      })
    }

    if (watch) {
      const { state, property, callback }: ReactivityConfig = watch
      const originKey = generateUUID()
      state.subscribe(originKey, property, (newVal) =>
        callback(element, newVal)
      )
      elementSubscriptions.push({
        element,
        onDestroyed: () => {
          state.unsubscribe(originKey, property)
        },
      })
    }

    if (onCreated) onCreated(element)

    return element
  }

  export function div(
    className?: string,
    children?: HTMLElement[]
  ): HTMLDivElement {
    return element<HTMLDivElement>("div", { className, children })
  }

  export function select(
    id: string,
    val: string[],
    eventHandlers: ElementProps<HTMLSelectElement> = {}
  ): HTMLSelectElement {
    return element<HTMLSelectElement>("select", {
      id,
      children: val.map((item: string) =>
        element("option", {
          value: item,
          text: item,
        })
      ),
      ...eventHandlers,
    })
  }
  export function input(
    id: string,
    val: boolean | number,
    eventHandlers: ElementProps<HTMLInputElement> = {}
  ): HTMLInputElement {
    return element<HTMLInputElement>("input", {
      id,
      type: getInputType(val),
      [typeof val === "boolean" ? "checked" : "value"]: val,
      ...eventHandlers,
    })
  }
  export function button(
    innerText: string,
    eventHandlers: ElementProps<HTMLButtonElement> = {}
  ): HTMLButtonElement {
    return element("button", {
      type: "button",
      innerText,
      ...eventHandlers,
    })
  }
}

// const reactiveEl = Rendr.element("div", {
//   className: "Asd",
//   watch: { state: appState, property: "123", callback: () => {} },
// })

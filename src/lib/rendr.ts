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
    querySelector: string,
    callback: { (e: Event): void }
  ) {
    const element = document.querySelector<T>(querySelector)
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

  export function resetEventHandlers() {
    while (eventHandlerRefs.length > 0) {
      const item = eventHandlerRefs.pop()
      item?.element.removeEventListener("change", item.callback)
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
    const el = Object.assign(document.createElement(tag), rest) as T
    if (onChange) el.onchange = () => onChange(el)
    if (onClick) el.onclick = () => onClick(el)
    if (children) el.append(...children)
    if (htmlFor && "htmlFor" in el) el.htmlFor = htmlFor
    if (onDestroyed) {
      elementSubscriptions.push({
        element: el,
        onDestroyed: () => {
          onDestroyed(el)
        },
      })
    }
    if (onCreated) onCreated(el)
    if (watch) return reactiveElement(el, watch)
    return el
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
    const type = getInputType(val)
    return element<HTMLInputElement>("input", {
      id,
      type,
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
  function reactiveElement<T extends HTMLElement>(
    el: T,
    config: ReactivityConfig
  ): T {
    const originKey = generateUUID()
    config.state.subscribe(originKey, config.property, (newVal) => {
      config.callback(el, newVal)
    })

    elementSubscriptions.push({
      element: el,
      onDestroyed: () => {
        config.state.unsubscribe(originKey, config.property)
      },
    })
    return el
  }
}

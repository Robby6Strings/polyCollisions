import { generateUUID } from "./math"

export namespace Rendr {
  const eventHandlerRefs: EventHandlerRef[] = []
  let elementSubscriptions: WatchedElementRef[] = []

  type EventHandlerRef = {
    element: HTMLElement
    callback: { (e: Event): any }
  }

  type WatchedElementRef = {
    element: HTMLElement
    onDestroyed: { (): void }
  }

  export type ElementEventProps<T> = {
    onCreated?: { (el: T, creator: { (props?: ElementProps<T>): T }): void }
    onChange?: { (el: T): void }
    onClick?: { (el: T): void }
    onDestroyed?: { (el: T): void }
  }

  export type ElementProps<T> = ElementEventProps<T> & {
    id?: string
    className?: string
    htmlFor?: string
    children?: HTMLElement[]
    computedProps?: { (props: Rendr.ElementProps<T>): Rendr.ElementProps<T> }
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
    throw new Error(
      "unable to get input type for val with type: " + typeof val + " - " + val
    )
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

  export function resetSubscriptions() {
    while (elementSubscriptions.length > 0) {
      elementSubscriptions.pop()?.onDestroyed()
    }
  }
  export function resetElementSubscriptions(el: HTMLElement) {
    let children = Array.from(el.children) as Array<HTMLElement>
    while (children.length) {
      const child = children.pop()!
      resetElementSubscriptions(child)
    }

    const subs = elementSubscriptions.filter((s) => s.element === el)
    while (subs.length) {
      subs.pop()?.onDestroyed()
    }
    elementSubscriptions = elementSubscriptions.filter((s) => s.element !== el)
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
      computedProps,
      ...rest
    } = props

    const element = Object.assign(
      document.createElement(tag),
      computedProps ? computedProps(rest) : rest
    ) as T

    if (onChange) element.onchange = () => onChange(element)
    if (onClick) element.onclick = () => onClick(element)
    if (children) element.append(...children)
    if (htmlFor && "htmlFor" in element) element.htmlFor = htmlFor

    if (onCreated) {
      function creator(newProps: ElementProps<T> = {}) {
        return Rendr.element(
          element.tagName,
          Object.keys(newProps).length
            ? Object.assign(props, { ...newProps })
            : props
        )
      }
      onCreated(element, creator)
    }
    if (onDestroyed) {
      elementSubscriptions.push({
        element,
        onDestroyed: () => {
          onDestroyed(element)
        },
      })
    }

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
    props: ElementProps<HTMLSelectElement> = {}
  ) {
    return element<HTMLSelectElement>("select", {
      id,
      children: val.map((item: string) =>
        element("option", {
          value: item,
          text: item,
        })
      ),
      ...props,
    })
  }
  export function input(
    id: string,
    val: boolean | number,
    props: ElementProps<HTMLInputElement> = {}
  ) {
    return element<HTMLInputElement>("input", {
      id,
      type: getInputType(val),
      [typeof val === "boolean" ? "checked" : "value"]: val,
      ...props,
    })
  }
  export function button(
    innerText: string,
    props: ElementProps<HTMLButtonElement> = {}
  ) {
    return element<HTMLButtonElement>("button", {
      type: "button",
      innerText,
      ...props,
    })
  }
}

// const reactiveEl = Rendr.element("div", {
//   className: "Asd",
//   observes: [{ stateObserver: appState, property: "123", callback: () => {} }],
// })

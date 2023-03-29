export type EventHandlerRef = {
  element: HTMLElement
  callback: { (e: Event): any }
}
export type ElementProps<T> = {
  htmlFor?: string
  children?: HTMLElement[]
  onCreated?: { (el: T): void }
  [key: string]: any
}

export type ElementEventProps<T> = {
  onCreated?: { (el: T): void }
  onChange?: { (el: T): void }
}

export type GenericEventProps = {
  onCreated?: { (el: HTMLElement): void }
  onChange?: { (el: HTMLElement): void }
}

const eventHandlerRefs: EventHandlerRef[] = []

export class Rendr {
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
  static resetEventHandlers() {
    while (eventHandlerRefs.length > 0) {
      const item = eventHandlerRefs.pop()
      item?.element.removeEventListener("change", item.callback)
    }
  }

  static element<T extends HTMLElement>(
    tag: string,
    props: ElementProps<T> = {}
  ): T {
    const { htmlFor, children, onCreated, onChange, ...rest } = props
    const el = Object.assign(document.createElement(tag), rest) as T
    if (onChange) el.onchange = () => onChange(el)
    if (children) el.append(...children)
    if (htmlFor && "htmlFor" in el) el.htmlFor = htmlFor
    if (onCreated) onCreated(el)
    return el
  }

  static select(
    id: string,
    val: string[],
    eventHandlers: ElementEventProps<HTMLSelectElement> = {}
  ): HTMLSelectElement {
    return Rendr.element<HTMLSelectElement>("select", {
      id,
      children: val.map((item: string) =>
        Rendr.element("option", {
          value: item,
          text: item,
        })
      ),
      ...eventHandlers,
    })
  }
  static input(
    id: string,
    val: boolean | number,
    eventHandlers: ElementEventProps<HTMLInputElement> = {}
  ): HTMLInputElement {
    const type = Rendr.getInputType(val)
    return Rendr.element<HTMLInputElement>("input", {
      id,
      type,
      [typeof val === "boolean" ? "checked" : "value"]: val,
      ...eventHandlers,
    })
  }
  static div(className?: string, children?: HTMLElement[]): HTMLDivElement {
    return Rendr.element("div", { className, children })
  }
  static button(innerText: string, onclick: { (): any }): HTMLButtonElement {
    return Rendr.element("button", { type: "button", innerText, onclick })
  }
}

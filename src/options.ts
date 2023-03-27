export const options = {
  strokeWidth: 2,
  renderBounds: false,
  pauseOnBlur: false,
  renderShapeBackgrounds: false,
  randomizeNumVertices: true,
  maxPolyVertices: 15,
  renderUI: (el: HTMLElement) => {
    Object.values(optionHtmlElements.togglers).forEach((item) =>
      el.append(item)
    )
    Object.values(optionHtmlElements.valueSetters).forEach((item) =>
      el.append(item)
    )
  },
}
const optionHtmlElements = {
  togglers: {
    renderBounds: createOptionToggler("renderBounds", "Render bounding boxes"),
    pauseOnBlur: createOptionToggler("pauseOnBlur", "Pause while not in focus"),
    renderShapeBackgrounds: createOptionToggler(
      "renderShapeBackgrounds",
      "Render shape backgrounds"
    ),
    randomizeNumVertices: createOptionToggler(
      "randomizeNumVertices",
      "Randomize Num Vertices"
    ),
  },
  valueSetters: {
    shapeStrokeWidth: createOptionValueSetter("strokeWidth", "Stroke width"),
    maxPolyVertices: createOptionValueSetter(
      "maxPolyVertices",
      "Max polygon vertices"
    ),
  },
}

export function createOptionToggler(
  optionKey: string,
  lblText: string
): HTMLElement {
  const checkbox = Object.assign(document.createElement("input"), {
    id: optionKey,
    type: "checkbox",
    //@ts-ignore
    checked: options[optionKey],
    onchange: () => {
      //@ts-ignore
      options[optionKey] = checkbox.checked
    },
  })
  const lbl = Object.assign(document.createElement("label"), {
    innerText: lblText,
  })
  lbl.htmlFor = checkbox.id

  const wrapperEl = Object.assign(document.createElement("div"), {
    className: "option",
  })
  wrapperEl.append(checkbox, lbl)
  return wrapperEl
}

export function createOptionValueSetter(
  optionKey: string,
  lblText: string
): HTMLElement {
  const input = Object.assign(document.createElement("input"), {
    id: optionKey,
    type: "number",
    //@ts-ignore
    value: options[optionKey],
    onchange: () => {
      //@ts-ignore
      options[optionKey] = input.value
    },
  })
  const lbl = Object.assign(document.createElement("label"), {
    innerText: lblText,
  })
  lbl.htmlFor = input.id

  const wrapperEl = Object.assign(document.createElement("div"), {
    className: "option",
  })
  wrapperEl.append(input, lbl)
  return wrapperEl
}

export function renderOptionsUI() {
  const optsBox = Object.assign(document.createElement("div"), {
    className: "options",
  })
  document.body.appendChild(optsBox)
  options.renderUI(optsBox)
}

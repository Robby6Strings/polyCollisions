export const options = {
  renderBounds: true,
  pauseOnBlur: false,
  renderShapeBackgrounds: false,
  randomizeNumVertices: false,
  gravity: true,
  maxPolyVertices: 3,
  strokeWidth: 1.5,
  shapeScale: 20,
}

function createOptionElement(optionKey: string, val: any): HTMLElement {
  const el = Object.assign(document.createElement("input"), {
    id: optionKey,
    type: typeof val === "boolean" ? "checkbox" : "number",
    [typeof val === "boolean" ? "checked" : "value"]: val,
    onchange: () => {
      Object.assign(options, {
        [optionKey]: typeof val === "boolean" ? el.checked : el.value,
      })
    },
  })

  const lbl = document.createElement("label")
  lbl.innerText = optionKey
  lbl.htmlFor = el.id

  const wrapperEl = document.createElement("div")
  wrapperEl.className = "option"
  wrapperEl.append(el, lbl)

  return wrapperEl
}

export function createOptionsUI() {
  const optsBox = Object.assign(document.createElement("div"), {
    className: "options",
  })
  optsBox.append(
    ...Object.entries(options).map(([key, val]) =>
      createOptionElement(key, val)
    )
  )
  return optsBox
}

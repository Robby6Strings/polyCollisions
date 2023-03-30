import { appState, defaultOptions } from "../../appState"
import { Rendr } from "../../lib/rendr"

export const optionGroup = (
  groupName: string,
  optionKeys: string[],
  events: Rendr.ElementEventProps<HTMLElement> = {}
) => {
  return Rendr.div("option-group", [
    Rendr.element("h5", { innerText: groupName }),
    Rendr.element("hr"),
    Rendr.div(
      "option-group-items",
      optionKeys.map((optionKey) =>
        option(
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

export const option = (
  key: string,
  val: number | boolean | string[],
  events: Rendr.ElementEventProps<HTMLSelectElement | HTMLInputElement> = {}
): HTMLDivElement => {
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
    : (el: HTMLSelectElement | HTMLInputElement, _: any) => {
        const type = Rendr.getInputType(val)
        if (type === "number") {
          const defaultVal = defaultOptions[key as keyof typeof defaultOptions]
          el.setAttribute(
            "step",
            defaultVal.toString().indexOf(".") > -1 ? "0.1" : "1"
          )
        }
      }

  return Rendr.div("option", [
    Rendr.element("label", {
      innerText: key,
      htmlFor: key,
    }),
    Array.isArray(val)
      ? Rendr.select(key, val, {
          onChange,
          onCreated,
        })
      : Rendr.input(key, val, {
          onChange,
          onCreated,
        }),
  ])
}

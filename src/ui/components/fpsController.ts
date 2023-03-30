import { appState } from "../../appState"
import { option } from "./option"

export const fpsController = (loopFn: { (): void }) => {
  return option("fps", appState.state.options.fps, {
    onChange: (el) => {
      clearInterval(appState.state.loopRef)
      const fps = parseInt(el.value)
      appState.update(({ options }) => ({
        loopRef: setInterval(loopFn, 1000 / fps),
        options: { ...options, fps },
      }))
    },
  })
}

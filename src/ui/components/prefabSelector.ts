import { appState, loadPrefab } from "../../appState"
import { strToPrefab } from "../../lib/prefab"
import { option } from "./option"

export const prefabSelector = () =>
  option("prefab", appState.state.options.prefab, {
    onCreated: (el) => (el.value = appState.state.prefab),
    onChange: (el) => {
      appState.update(() => ({ polygons: [] }))
      loadPrefab(strToPrefab(el.value))
    },
  })

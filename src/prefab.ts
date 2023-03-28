import { Polygon } from "./polygon"
import { createDefaultPrefab } from "./prefabs/defaultPrefab"
import { createTestPrefab } from "./prefabs/testPrefab"

export enum Prefab {
  Default = "Default",
  Test = "Test",
}

export const getPrefabs = () => [Prefab.Default, Prefab.Test]

export function strToPrefab(str: string): Prefab {
  switch (str) {
    case "Default":
      return Prefab.Default
    case "Test":
      return Prefab.Test
    default: {
      throw new Error(`Unknown prefab: ${str}`)
    }
  }
}

export function getPrefabCreator(prefab: Prefab): { (): Polygon[] } {
  switch (prefab) {
    case Prefab.Default:
      return createDefaultPrefab
    case Prefab.Test:
      return createTestPrefab
  }
  //throw new Error("Failed to load prefab: " + prefab)
}

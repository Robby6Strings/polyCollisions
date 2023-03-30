import { Emitter } from "./emitter"
import { Polygon } from "./polygon"
import { createBucketPrefab } from "../prefabs/bucketPrefab"
import { createDefaultPrefab } from "../prefabs/defaultPrefab"
import { createTestPrefab } from "../prefabs/testPrefab"

export interface IPrefab {
  polygons: Polygon[]
  emitters?: Emitter[]
}

export enum Prefab {
  Default = "Default",
  Test = "Test",
  Bucket = "Bucket",
}

export const getPrefabs = () => [Prefab.Default, Prefab.Test, Prefab.Bucket]

export function strToPrefab(str: string): Prefab {
  switch (str) {
    case "Default":
      return Prefab.Default
    case "Test":
      return Prefab.Test
    case "Bucket":
      return Prefab.Bucket
    default: {
      throw new Error(`Unknown prefab: ${str}`)
    }
  }
}

export function getPrefabCreator(prefab: Prefab): { (): IPrefab } {
  switch (prefab) {
    case Prefab.Default:
      return createDefaultPrefab
    case Prefab.Test:
      return createTestPrefab
    case Prefab.Bucket:
      return createBucketPrefab
  }
  //throw new Error("Failed to load prefab: " + prefab)
}

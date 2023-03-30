export type observerCallback = { (newValue: any): any }
export type observerMap = Map<string, Map<string, observerCallback>>

export interface IStateObserver {
  observers: observerMap
  state: any
  subscribe(originKey: string, stateKey: any, callback: observerCallback): void
  unsubscribe(originKey: string, stateKey: any): void
  update(predicate: { (values: any): Partial<any> }): void
}

export class StateObserver<T extends Object> implements IStateObserver {
  observers: observerMap = new Map<string, Map<string, observerCallback>>()
  state: T
  constructor(obj: T) {
    this.state = new Proxy(
      { ...obj },
      {
        set: (target: T, prop, value) => {
          if (target[prop as keyof typeof target] !== value) {
            this.observers
              .get(prop as string)
              ?.forEach((callback: observerCallback) => callback(value))
          }
          return Reflect.set(target, prop, value)
        },
      }
    )
  }
  subscribe(originKey: string, stateKey: keyof T, callback: observerCallback) {
    const keyObserver = this.observers.get(stateKey as string)
    if (keyObserver) {
      keyObserver.set(originKey, callback)
      return
    }
    const newMap: Map<string, observerCallback> = new Map()
    newMap.set(originKey, callback)
    this.observers.set(stateKey as string, newMap)
  }
  unsubscribe(originKey: string, stateKey: keyof T) {
    const keyObservers = this.observers.get(stateKey as string)
    if (!keyObservers) return
    keyObservers.delete(originKey)
  }
  update(predicate: { (values: T): T | Partial<T> }) {
    Object.assign(this.state, predicate(this.state))
  }
}

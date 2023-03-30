export type observerCallback = { (newValue: any): any }
export type observerMap = Map<string, Map<string, observerCallback>>

export interface IState {
  state: any
  _observers: observerMap
  subscribe(originKey: string, stateKey: any, callback: observerCallback): void
  unsubscribe(originKey: string, stateKey: any): void
  update(val: { (values: any): any }): void
}

export interface IObservableState<T> extends IState {
  state: T
  update(val: { (values: T): T }): void
}

export class ObservableState<T extends Object> implements IObservableState<T> {
  _observers: observerMap = new Map()
  state: T
  constructor(obj: T) {
    this.state = new Proxy(
      { ...obj },
      {
        set: (target: T, prop, value) => {
          if (target[prop as keyof typeof target] !== value) {
            this._observers
              .get(prop as string)
              ?.forEach((callback: observerCallback) => callback(value))
          }
          return Reflect.set(target, prop, value)
        },
      }
    )
  }
  subscribe(originKey: string, stateKey: keyof T, callback: observerCallback) {
    const keyObservers = this._observers.get(stateKey as string)
    if (keyObservers) {
      keyObservers.set(originKey, callback)
      return
    }
    const newMap: Map<string, observerCallback> = new Map()
    newMap.set(originKey, callback)
    this._observers.set(stateKey as string, newMap)
  }
  unsubscribe(originKey: string, stateKey: keyof T) {
    const keyObservers = this._observers.get(stateKey as string)
    if (!keyObservers) return
    keyObservers.delete(originKey)
  }
  update(val: { (values: T): Partial<T> }) {
    Object.assign(this.state, val(this.state))
  }
}

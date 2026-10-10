/**
 * A ~60 line external store.
 *
 * Why not a state library: the experience only needs a handful of shared flags
 * and anything that changes per frame (camera pose, shader uniforms, particle
 * motion) deliberately bypasses React entirely. `useSyncExternalStore` from
 * React 18 gives us tear-free subscriptions without adding a dependency.
 *
 * Selector contract: selectors MUST return a primitive or a referentially
 * stable value. Returning a freshly allocated object/array on every call would
 * make React re-render forever.
 */

import { useCallback, useSyncExternalStore } from 'react';

type Listener = () => void;

export interface Store<T extends object> {
  getState: () => T;
  setState: (patch: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<Listener>();

  const getState = () => state;

  const setState: Store<T>['setState'] = (patch) => {
    const next = typeof patch === 'function' ? patch(state) : patch;
    const keys = Object.keys(next) as Array<keyof T>;

    let changed = false;
    for (const key of keys) {
      if (!Object.is(state[key], next[key] as T[keyof T])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;

    state = Object.assign({}, state, next) as T;
    for (const listener of Array.from(listeners)) listener();
  };

  const subscribe: Store<T>['subscribe'] = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { getState, setState, subscribe };
}

export function useStoreValue<T extends object, S>(store: Store<T>, selector: (state: T) => S): S {
  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

# 响应式系统reactivity

## reactive

### 使用proxy

```reactive.ts
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap,
  )
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>,
) {
  //....此处省略无数代码
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers,
  )
  proxyMap.set(target, proxy)
  return proxy
}
```

### 使用Reflect, 重写proxy的proxyHandler中的set/get等其他方法

为什么使用Reflect？
不直接访问属性或改属性。receiver可以解决this指向问题。eg: Reflect.get(obj, fullname, receiver);

```md
const obj = {
    name: 'durant',
    fullname() {
        return 'kevin' + this.name;
    }
}
```

```baseHandlers.ts
export const mutableHandlers: ProxyHandler<object> =
  /*#__PURE__*/ new MutableReactiveHandler()

//重点寻找get的 track
 get(target: Target, key: string | symbol, receiver: object) {
    // ...省略

    const res = Reflect.get(target, key, receiver)

    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    // ...省略

    return res
  }

//重点寻找set的 trigger
  set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ): boolean {
    let oldValue = (target as any)[key]

    // ...省略

    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }

```

```collectionHandlers.ts
collectionHandlers???
```

### 收集依赖 track

```reactiveEffect.ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (shouldTrack && activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep(() => depsMap!.delete(key))))
    }
    trackEffect(
      activeEffect,
      dep,
      __DEV__
        ? {
            target,
            type,
            key,
          }
        : void 0,
    )
  }
}
```

### 触发更新 trigger

```reactiveEffect.ts
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>,
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }

  let deps: (Dep | undefined)[] = []
  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    deps = [...depsMap.values()]
  } else if (key === 'length' && isArray(target)) {
    const newLength = Number(newValue)
    depsMap.forEach((dep, key) => {
      if (key === 'length' || (!isSymbol(key) && key >= newLength)) {
        deps.push(dep)
      }
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      deps.push(depsMap.get(key))
    }

    // also run for iteration key on ADD | DELETE | Map.SET
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // new index added to array -> length changes
          deps.push(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }

  pauseScheduling()
  for (const dep of deps) {
    if (dep) {
      triggerEffects(
        dep,
        DirtyLevels.Dirty,
        __DEV__
          ? {
              target,
              type,
              key,
              newValue,
              oldValue,
              oldTarget,
            }
          : void 0,
      )
    }
  }
  resetScheduling()
}
```

### 收集依赖的effect

```effect.ts
export function trackEffect(
  effect: ReactiveEffect,
  dep: Dep,
  debuggerEventExtraInfo?: DebuggerEventExtraInfo,
) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)
    const oldDep = effect.deps[effect._depsLength]
    if (oldDep !== dep) {
      if (oldDep) {
        cleanupDepEffect(oldDep, effect)
      }
      effect.deps[effect._depsLength++] = dep
    } else {
      effect._depsLength++
    }
    if (__DEV__) {
      effect.onTrack?.(extend({ effect }, debuggerEventExtraInfo!))
    }
  }
}
```

### 触发依赖的effect

```effect.ts
export function triggerEffects(
  dep: Dep,
  dirtyLevel: DirtyLevels,
  debuggerEventExtraInfo?: DebuggerEventExtraInfo,
) {
  pauseScheduling()
  for (const effect of dep.keys()) {
    if (!effect.allowRecurse && effect._runnings) {
      continue
    }
    if (
      effect._dirtyLevel < dirtyLevel &&
      (!effect._runnings || dirtyLevel !== DirtyLevels.ComputedValueDirty)
    ) {
      const lastDirtyLevel = effect._dirtyLevel
      effect._dirtyLevel = dirtyLevel
      if (
        lastDirtyLevel === DirtyLevels.NotDirty &&
        (!effect._queryings || dirtyLevel !== DirtyLevels.ComputedValueDirty)
      ) {
        if (__DEV__) {
          effect.onTrigger?.(extend({ effect }, debuggerEventExtraInfo))
        }
        effect.trigger()
        if (effect.scheduler) {
          queueEffectSchedulers.push(effect.scheduler)
        }
      }
    }
  }
  resetScheduling()
}
```

### :star: 最重要的effect

```effect.ts
export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions,
): ReactiveEffectRunner {
  if ((fn as ReactiveEffectRunner).effect instanceof ReactiveEffect) {
    fn = (fn as ReactiveEffectRunner).effect.fn
  }

  const _effect = new ReactiveEffect(fn, NOOP, () => {
    if (_effect.dirty) {
      _effect.run()
    }
  })
  if (options) {
    extend(_effect, options)
    if (options.scope) recordEffectScope(_effect, options.scope)
  }
  if (!options || !options.lazy) {
    _effect.run()
  }
  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner.effect = _effect
  return runner
}
```

## ref

### wrap,包了一层，因为对象在访问属性的时候，可以进行拦截

```ref.ts
function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly __v_isShallow: boolean,
  ) {
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    const useDirectValue =
      this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      triggerRefValue(this, DirtyLevels.Dirty, newVal)
    }
  }
}
```

### ref收集依赖 trackRefValue

```ref.ts
export function trackRefValue(ref: RefBase<any>) {
  if (shouldTrack && activeEffect) {
    ref = toRaw(ref)
    trackEffect(
      activeEffect,
      ref.dep ||
        (ref.dep = createDep(
          () => (ref.dep = undefined),
          ref instanceof ComputedRefImpl ? ref : undefined,
        )),
      __DEV__
        ? {
            target: ref,
            type: TrackOpTypes.GET,
            key: 'value',
          }
        : void 0,
    )
  }
}
```

### ref触发更新 triggerRefValue

```ref.ts
export function triggerRefValue(
  ref: RefBase<any>,
  dirtyLevel: DirtyLevels = DirtyLevels.Dirty,
  newVal?: any,
) {
  ref = toRaw(ref)
  const dep = ref.dep
  if (dep) {
    triggerEffects(
      dep,
      dirtyLevel,
      __DEV__
        ? {
            target: ref,
            type: TriggerOpTypes.SET,
            key: 'value',
            newValue: newVal,
          }
        : void 0,
    )
  }
}

```

### 剩下同reactive

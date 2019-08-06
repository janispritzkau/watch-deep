
export interface WatchOptions {
    deep?: boolean
    /** trigger callback immediately */
    immediate?: boolean
}


export function watch<T extends object>(target: T, callback: (target: any) => void, options: WatchOptions = {}) {
    options = { deep: true, ...options }

    // Not a 100% sure if this causes a memory leak
    const proxyMap = new WeakMap<object, object>()

    const proxy = deepWatch(target, callback, options.deep!, proxyMap)
    if (options.immediate) callback(target)

    return proxy
}

function deepWatch<T extends object>(target: T, callback: (target: any) => void, deep: boolean, proxyMap: WeakMap<object, object>): T {
    if (Object(target) !== target) return target

    if (proxyMap.has(target)) return target

    for (const key of Object.keys(target)) {
        (<any>target)[key] = deepWatch((<any>target)[key], callback, deep, proxyMap)
    }

    const watchValue = (value: object) => {
        if (deep) {
            return deepWatch(value, callback, deep, proxyMap)
        } else {
            return value
        }
    }

    const notify = <T>(x: T) => {
        callback(target)
        return x
    }

    const proxy = new Proxy(target, {
        get(target, key) {
            const value = Reflect.get(target, key)
            if (target instanceof Map || target instanceof Set) {
                if (key == "set") {
                    return (key: any, val: any) => notify(value.call(target, key, watchValue(val)))
                } else if (key == "add") {
                    return (val: any) => notify(value.call(target, watchValue(val)))
                } else if (key == "delete" || key == "clear") {
                    return (...args: any) => notify(value.apply(target, args))
                }
                return value instanceof Function ? value.bind(target) : value
            }
            return value
        },
        set(target, key, value) {
            if (target instanceof Array && key == "length") {
                return target.length = value
            }
            return notify(Reflect.set(target, key, watchValue(value)))
        },
        deleteProperty(target, key) {
            return notify(Reflect.deleteProperty(target, key))
        }
    })

    proxyMap.set(proxy, target)

    return proxy
}


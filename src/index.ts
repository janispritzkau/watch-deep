
export interface WatchOptions {
    deep?: boolean
    /** trigger callback immediately */
    immediate?: boolean
}

export function watch<T extends object>(target: T, callback: (target: any) => void, options: WatchOptions = {}): T {
    if (Object(target) !== target) return target
    if (options.deep == null) options.deep = true

    for (const key in target) {
        (<any>target)[key] = watch((<any>target)[key], callback, options)
    }

    const watchValue = (value: object) => {
        if (options.deep) {
            return watch(value, callback, options)
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

    if (options.immediate) callback(target)

    return proxy
}


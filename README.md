# watch-deep

Tiny libray to watch deep changes in objects, arrays with support for ES6 `Map` and `Set`.

```js
import { watch } from "./src"

const obj = watch({} as any, target => {
    console.log("change detected in", target)
})

// These changes will be detected
obj.map = new Map
obj.map.set(1, { a: [] })
obj.map.get(1).a.push(2)
delete obj.map

const b = { c: 3 }
obj.b = b
// This won't be detected because the object must first be proxied and then
// retrieved from the object tree to observe changes.
b.c = 999
```

Be careful with circular references since those will cause a stack overflow.

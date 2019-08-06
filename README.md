# watch-deep

A small library to watch deep changes in objects, arrays with support for ES6 `Map` and `Set`.

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

const a = { b: 123 }
obj.a = a
// This won't be detected because the object must first be proxied and then
// retrieved from the object tree to observe changes.
a.b = 999

// Also keep in mind that proxied objects that have been deleted from the
// object tree will also trigger a change.
const b = obj.a
delete obj.a
b.a = 1
```

Be careful with circular references since those will cause a stack overflow.

# api-factory

Compose an API over a state. Allows use cases like:

- A common API over similar but different backing data, via adapters
- Composable plugin systems
- Dependency injection
- Hiding underlying state from consuming code
- Controlling mutations of state (allows for undo/redo etc)

We use this internally to get a single unified API that works over various tree
formats, particularly an API over the browser DOM/a virtual DOM ala jQuery, with
various custom plugins for different use cases and to keep the core API compact.

## Install

`npm install @mojule/api-factory`

## Examples

Examples will use a fictional API over a cartesian point - they may seem so
trivial at first that it seems like something like `api-factory` is unnecessary
for this use case, but as we build the API up through a series of examples, the
benefits will hopefully become clear.

### Basic usage

[examples/point/basic.js](examples/point/basic.js)
```javascript
const ApiFactory = require( '@mojule/api-factory' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const Point = ApiFactory( pointModule )

const point = Point( { x: 5, y: 7 } )

console.log( point.x(), point.y() ) // 5  7
```

A module is a function that takes the current API and a state, and returns an
object containing further API functions which are added to the current API.

Normally you would compose the API out of multiple modules, in which case you
pass `ApiFactory` an array:

[examples/point/basic-state.js](examples/point/basic-state.js)
```javascript
// pointModule is same as above

const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = state.x + x
      const newY = state.y + y

      return { x: newX, y: newY }
    }
  }
}

const Point = ApiFactory( [ pointModule, coreModule ] )

const p1 = { x: 5, y: 7 }

const point = Point( p1 )

const p2 = point.add( -1, 2 )

// original point is unaffected:
console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }
```

You'll note that we've only used the `state` argument in our modules so far -
instead of using the state argument, let's redo the above example using the
`api` argument:

[examples/point/basic-api.js](examples/point/basic-api.js)
```javascript
const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      return { x: newX, y: newY }
    }
  }
}

const Point = ApiFactory( [ pointModule, coreModule ] )

const p1 = { x: 5, y: 7 }

const point = Point( p1 )

const p2 = point.add( -1, 2 )

// original point is unaffected:
console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }
```

Why would we want to use the api to get `x` and `y` rather than getting them
directly from the state, given that we have access to the state?

Imagine that our code consumes points in two different formats, one where
they're stored as arrays, and one where they are stored as objects:

```javascript
const arrayPointData = [ 5, 7 ]
const objectPointData = { x: 5, y: 7 }
```

By decoupling our core functions from the state, we can implement an adapter
for each point type, and then reuse our core functions (just `add` at present)
for any point type:

[examples/point/basic-adapters.js](examples/point/basic-adapters.js)
```javascript
const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const arrayPointModule = ( api, state ) => {
  return {
    x: () => state[ 0 ],
    y: () => state[ 1 ]
  }
}

const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      return { x: newX, y: newY }
    }
  }
}

const Point = ApiFactory( [ pointModule, coreModule ] )
const ArrayPoint = ApiFactory( [ arrayPointModule, coreModule ] )

const p1 = { x: 5, y: 7 }
const a1 = [ 5, 7 ]

const point = Point( p1 )
const arrayPoint = ArrayPoint( a1 )

const p2 = point.add( -1, 2 )
const a2 = arrayPoint.add( -1, 2 )

console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }

console.log( a1 ) // [ 5, 7 ]
console.log( a2 ) // { x: 4, y: 9 }
```

You'll notice that regardless of the input type, we always return an object
point. This might be what we want (we want to normalize our input and work with
a single format for output) in which case we don't have to do anything extra,
or we might need to pass our results back to some other code, and it needs to be
in the original format, in which case we can add an extra function to each of
the adapters:

[examples/point/adapters-create.js](examples/point/adapters-create.js)
```javascript
const pointModule = ( api, state ) => {
  return {
    createData: ( x, y ) => ({ x, y }),
    x: () => state.x,
    y: () => state.y
  }
}

const arrayPointModule = ( api, state ) => {
  return {
    createData: ( x, y ) => [ x, y ],
    x: () => state[ 0 ],
    y: () => state[ 1 ]
  }
}

const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      return api.createData( newX, newY )
    }
  }
}
```

**TO BE CONTINUED**

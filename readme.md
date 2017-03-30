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

Examples will use a fictional API over a Cartesian point - they may seem so
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

### Adding additional modules

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

### Calling the API from modules

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

### Implementing adapters

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

### Creating instances of the API from your modules

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

Alternatively, we may want to return a point API, so that we can call further
methods on it:

```javascript
const point1 = Point({ x: 5, y: 7 })
const point2 = point1.add( -1, 2 )
const point3 = point2.add( 3, -6 )
```

The `api` argument passed to your modules is not just a bag of the functions
which have been added to the API so far, it can also construct a new instance of
the API if called as a function. So to return a point API instead of raw data,
we can do this:

```javascript
const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      const data = api.createData( newX, newY )

      return api( data )
    }
  }
}
```

While we're at it, let's add a function to the core that allows us to get the
raw data out of an API node:

```javascript
const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      const data = api.createData( newX, newY )

      return api( data )
    },
    getData: () => api.createData( api.x(), api.y() )
  }
}
```

So now we can go from raw data in any format we have an adapter for, to a common
point API that works the same regardless of the underlying format, back to the
original format:

[examples/point/api-function.js](examples/point/api-function.js)
```javascript
const p1 = { x: 5, y: 7 }
const point1 = Point( p1 )
const point2 = point1.add( -1, 2 )
const point3 = point2.add( 3, -6 )
const p2 = point2.getData()
const p3 = point3.getData()

const a1 = [ 5, 7 ]
const arrayPoint1 = ArrayPoint( a1 )
const arrayPoint2 = arrayPoint1.add( -1, 2 )
const arrayPoint3 = arrayPoint2.add( 3, -6 )
const a2 = arrayPoint2.getData()
const a3 = arrayPoint3.getData()

console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }
console.log( p3 ) // { x: 7, y: 3 }

console.log( a1 ) // [ 5, 7 ]
console.log( a2 ) // [ 4, 9 ]
console.log( a3 ) // [ 7, 3 ]
```

### Decorating existing API functions

For the next example, we'll add a decorator function that overrides `add` to
allow it to take either two number arguments, or a single point API argument -
because the object point API and the array point API have the same syntax, we
can pass them to each other's add function.

To do this we'll create a new module rather than extend the existing `add`
function, to demonstrate how to decorate existing modules:

[examples/point/decorate.js](examples/point/decorate.js)
```javascript
const isFunction = subject => typeof subject === 'function'
const isPoint = subject => subject && isFunction( subject.x ) && isFunction( subject.y )

const addPointOrNumbersModules = ( api, state ) => {
  // capture the existing add function
  const { add } = api

  return {
    add: ( a, b ) => {
      let x, y

      if( isPoint( a ) ){
        x = a.x()
        y = a.y()
      } else {
        x = a
        y = b
      }

      // call the original add function
      return add( x, y )
    }
  }
}
```

Following on from this, you could extend this decorator or add a new one that
also accepts raw data as an argument.

### Scoping functions

#### Private functions

You can make plugin functions available to other plugins, but not available on
the external API by prefixing them with an underscore.

To make them also visible on the external API (for example, for debugging or
testing purposes), pass the option `removePrivate: false`.

Private functions can be overridden like any other API function.

```javascript
const loggerModule = ( api, state ) => {
  return {
    _logState: () => console.log( state )
  }
}
```

#### Static functions

Static functions work like private functions, but are prefixed with a `$` sign.

They are attached to the returned API factory instead of instances of the API,
with the `$` prefix removed. When called by internal functions you still need
to use the `$` prefix.

To make them also visible on the external API instances use the option
`removeStatic: false`.

Statics should not access state, and should only call other static methods on
the `api` argument, otherwise an exception may be thrown. It is fine for
non-static methods to call static methods.

```javascript
const staticModule = ( api, state ) => {
  return {
    $isIntegerPoint: p =>
      p && typeof p === 'object' && Number.isInteger( p.x ) && Number.isInteger( p.y ),
    isIntegerPoint: () => api.$isIntegerPoint( state )
  }
}

const Point = ApiFactory(
  [ pointModule, staticModule ],
  { isState: isObjectPoint }
)

const p1 = { x: 5, y: 7 }

console.log( Point.isIntegerPoint( p1 ) ) // true

const point1 = Point( p1 )

console.log( point1.isIntegerPoint() ) // true
```

### Options

We can also pass some options to `ApiFactory`. Any options passed will override
the defaults:

```javascript
const defaultOptions = {
  getStateKey: state => state,
  isState: state => true,
  exposeState: true,
  removePrivate: true,
  removeStatic: true
}
```

#### Hiding state from comsuming code

We have a dirty little secret - every instance of an API has the state attached
to it by default:

[examples/point/expose-state.js](examples/point/expose-state.js)
```javascript
const point = Point( { x: 5, y: 7 } )

console.log( point.state ) // { x: 5, y: 7 }
```

This is convenient for some use cases, but you may want to ensure that the
consuming code can never alter the state without going through your API. In this
case, we just pass `exposeState: false` in the options:

[examples/point/hide-state.js](examples/point/hide-state.js)
```javascript
const Point = ApiFactory( pointModule, { exposeState: false } )
const point = Point( { x: 5, y: 7 } )

console.log( point.state ) // undefined
```

#### Caching the API and allowing === comparison

The `ApiFactory` caches the generated API instances so that you don't have
the overhead of wrapping state every time you construct an instance from the
same underlying state.

By default, it uses the state as the cache key:

[examples/point/default-state-key.js](examples/point/default-state-key.js)
```javascript
const p1 = { x: 5, y: 7 }
const p2 = { x: 5, y: 7 } // same x and y value, but different object instance

const point1 = Point( p1 )
const point2 = Point( p1 )
const point3 = Point( p2 )

console.log( point1 === point2 ) // same underlying state, returns true
console.log( point1 === point3 ) // different state, returns false
```

You can add a custom function to the options to make custom cache keys - for
example, points with the same x and y values return the same API instance:

[examples/point/custom-state-key.js](examples/point/custom-state-key.js)
```javascript
const getStateKey = state => state.x + ' ' + state.y

const Point = ApiFactory( pointModule, { getStateKey } )

const p1 = { x: 5, y: 7 }
const p2 = { x: 5, y: 7 }
const p3 = { y: 7, x: 5 }
const p4 = { x: 5, y: 7, z: -2 }
const p5 = { x: 3, y: 12 }

const point1 = Point( p1 )
const point2 = Point( p2 )
const point3 = Point( p3 )
const point4 = Point( p4 )
const point5 = Point( p5 )

console.log( point1 === point2 ) // same state key, true
console.log( point2 === point3 ) // true
console.log( point3 === point4 ) // true
console.log( point4 === point5 ) // different, false
```

#### Determining if an API can handle a given state

You can also implement a custom predicate that indicates that your API can
take a certain state - the default implementation always returns true.

The API will throw an error if this function returns false, and will also attach
the predicate to itself.

One example use case for this would be creating a wrapper function that
determines what underlying API to use:

[examples/point/is-state.js](examples/point/is-state.js)
```javascript
const isNumber = subject => typeof subject === 'number' && !Number.isNaN( subject )

const isObjectPoint = state =>
  state && typeof state === 'object' && isNumber( state.x ) && isNumber( state.y )

const isArrayPoint = state =>
  Array.isArray( state ) && isNumber( state[ 0 ] ) && isNumber( state[ 1 ] )

const ObjectPoint = ApiFactory( pointModule, { isState: isObjectPoint } )
const ArrayPoint = ApiFactory( arrayPointModule, { isState: isArrayPoint } )

const PointApis = [ ObjectPoint, ArrayPoint ]

const Point = state => {
  const Api = PointApis.find( P => P.isState( state ) )

  if( !Api ) throw new Error( 'No API found that handles that state' )

  return Api( state )
}

const p1 = { x: 5, y: 7 }
const p2 = [ 5, 7 ]

const point1 = Point( p1 )
const point2 = Point( p2 )

console.log( point1.x(), point1.y() ) // 5 7
console.log( point2.x(), point2.y() ) // 5 7
```

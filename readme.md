# api-factory

**Caution** - work in progress - at this stage this doc is more draft/outline than
anything

## Why?

It's a simple way to build APIs that enables a lot of cool things to be done
with little effort, like:

- Put a cool feature list here, including but not limited to:
- Plugins
- Optional validation (faster without it, safer with - skip validation on data
  known to be good for big efficiency gains)
- Build subsets and supersets of your API (minimal tree, jquery++ level of tree)
- Easy decorators:
  - logging
  - validation
  - save and replay action lists
  - undo/redo stack
- Create adapters and bridges to interop with other data structures/libraries
- Memoizing
- Object pooling
- Dependency injection

I'm sold on paring js down to its most powerful features and keeping things very
simple - eliminate weird `this` behaviour, rely on functional concepts, simple
objects (preferably JSON-serializable), object composition instead of
inheritance etc. - but still be able to build complex things out of simple
parts. Class-free OO. Started with Crockford's JS Good Parts but also see
his talks on the better parts, rationale behind ES6 and etc; Crockford, Eric
Elliot, Mattias Petter Johansson et al

## How?

## Things to consider for doc:

- Using functional composition to create object oriented APIs over a state.
- Functional and object oriented but not class based
- Favouring composition over inheritance - GoF
- Avoiding weird classes/prototypes, `this` etc - fragile, hacky
- Basis is composing functions and objects, two aspects of js that are great
- Plugins are just closures
- Modular, resuable
- Inversion of control / dependency injection
- Controlling mutation / access to state - create a small surface area for mutation
- Optional validation
- Override/wrapper/decorator plugins
- Adapters, bridges etc.
- Action pattern, undo/redo stack etc
- Hide state from consumers
- Why core/publics/privates/statics
- Decoupling/separation of concerns etc.
- Getting state from an api instance, getting an api instance from state - getApi/getState
- Caching/memoizing map etc. - === comparison and etc
- State key
- Creating state
- Plugin order / capturing previous functions / overriding and calling previous etc
- onCreate - observing creation of api instances
- isState
- Object pooling?
- Examples: tree, grid

Never use:
  - falsiness
  - null
  - this
  - prototype
  - class
  - etc

## Api - a factory for creating instances

Call ApiFactory with your plugins, get back an factory for your specific API
type that takes arguments that define the underlying state and get back an API
instance

eg:

```javascript
const ApiFactory = require( '@mojule/api-factory' )
const plugins = require( './path/to/your/plugins' )

// create a Point factory by passing ApiFactory plugins for managing point state
const Point = ApiFactory( plugins )

// create Point API instances
const p1 = Point( 3, 4 )
const p2 = Point( 4, 5 )
// call a plugin
const p3 = p1.add( p2 )
```

## api - an instance

An instance of your API - all your public plugins operating over your state

## plugins

Plugins can be of four types, `static`, `core`, `private`, `public`:

### static plugins

Particularly useful for functions that create new instances, eg a function that
takes a serialized JSON version of the state and returns a new api instance

A static plugin closure looks like:

```javascript
staticApi => {
  staticApi.deserialize = jsonObj => { /*...*/ }
}
```

#### default statics provided by API factory

```javascript
staticApi => {
  // same as calling Api( ...args )
  staticApi.create = ( ...args ) => { /*...*/ }
}
```

### core plugins

Things that are core to generating APIs, not specific to your API use case or
the type of state you're working with - if a function would be useful regardless
of the resultant API or underlying state, it belongs in `core`

*Kinda like private statics if you're used to class oriented programming*

A plugin closure looks like:

```javascript
( coreApi, staticApi ) => {
  // attach your core plugins
  coreApi.someCoreFunction = ( ...args ) => { //... }
}
```

#### default core plugins used by API factory:

Usually you would override some or all of these for your use case

```javascript
const core = api => {
  api.createState = ( ...args ) => args[ 0 ]
  api.getStateKey = state => state
  api.isState = state => true
  api.onCreate = api => {}
}
```

### privates

Plugins that can be called internally but aren't exposed to the end consumer of
the API

```javascript
( privateApi, state, coreApi, staticApi ) => {
  privateApi.someFn = ( ...args ) => { /*...*/ }
}
```

There are no default plugins, as they are dependant on the type of state etc

### publics

The plugins that end up being exposed to the end consumer of your API code

```javascript
( publicApi, state, coreApi, privateApi, staticApi ) => {
  publicApi.someFn = ( ...args ) => { /*...*/ }
}
```

## Install

`npm install @mojule/api-factory`

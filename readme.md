# api-factory

# Documentation outdated - update for 1.0.0!!!

## Why?

I'm sold on paring js down to its most powerful features and keeping things very
simple - eliminate weird `this` behaviour, rely on functional concepts, simple
objects (preferably JSON-serializable), object composition instead of
inheritance etc. - but still be able to build complex things out of simple
parts. Class-free OO. Started with Crockford's JS Good Parts but also see
his talks on the better parts, rationale behind ES6 and etc; Crockford, Eric
Elliot, Mattias Petter Johansson et al

## How?

## Things need to be in doc:

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

## api - an instance

## static plugins

Particularly useful for functions that create new instances, eg a function that
takes a serialized JSON version of the state and returns a new api instance

A static plugin closure looks like:

```javascript
staticApi => {
  staticApi.deserialize = jsonObj => { /*...*/ }
}
```

### default

```javascript
staticApi => {
  // same as calling Api( ...args )
  staticApi.create = ( ...args ) => { /*...*/ }
}
```

## core plugins

Things that are core to generating APIs, not specific to the type of API or the
type of state - if a function would be useful with any API, it belongs in core

Kinda like private statics if you're used to class oriented programming

A plugin closure looks like:

```javascript
( coreApi, staticApi ) => {
  // attach your core plugins
  coreApi.someCoreFunction = ( ...args ) => { //... }
}
```

### defaults

```javascript
const core = api => {
  api.createState = ( ...args ) => args[ 0 ]
  api.getStateKey = state => state
  api.isState = state => true
  api.onCreate = api => {}
}
```

## privates

```javascript
( privateApi, state, coreApi, staticApi ) => {
  privateApi.someFn = ( ...args ) => { /*...*/ }
}
```

## publics

```javascript
( publicApi, state, coreApi, privateApi, staticApi ) => {
  publicApi.someFn = ( ...args ) => { /*...*/ }
}
```

Compose an API over a state. Allows use cases like:

- A common API over similar but different backing data, via adapters
- Composable plugin systems
- Dependency injection
- Hiding underlying state from consuming code
- Controlling mutations of state (allows for undo/redo etc)

We use this internally to get a single unified API that works over various tree
formats, particularly an API over the browser DOM/a virtual DOM a la jQuery,
with various custom plugins for different use cases and to keep the core API
compact.

## Install

`npm install @mojule/api-factory`

'use strict'

const assert = require( 'assert' )
const is = require( '@mojule/is' )
const ApiFactory = require( '../src' )

const isNumber = n => typeof n === 'number' && !Number.isNaN( n )
const isFunction = f => typeof f === 'function'

describe( 'ApiFactory', () => {
  const pointModule = ( api, state ) => {
    return {
      x: () => state.x,
      y: () => state.y
    }
  }

  const integerPointModule = ( api, state ) => {
    const { x, y } = api

    return {
      x: () => Math.floor( x() ),
      y: () => Math.floor( y() )
    }
  }

  const isPoint = point =>
    is.object( point ) && is.number( point.x ) && is.number( point.y )

  const pointKey = point => `${ point.x } ${ point.y}`

  it( 'Creates an API', () => {
    const Point = ApiFactory( pointModule )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.x(), 5 )
    assert.equal( point.y(), 7 )
  })

  it( 'Exposes state', () => {
    const Point = ApiFactory( pointModule )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.state.x, 5 )
    assert.equal( point.state.y, 7 )
  })

  it( 'Hides state', () => {
    const Point = ApiFactory( pointModule, { exposeState: false } )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.state, undefined )
  })

  it( 'Enforces isState', () => {
    const NoIsState = ApiFactory( pointModule )

    assert( NoIsState.isState() )

    const Point = ApiFactory( pointModule, { isState: isPoint } )

    assert.doesNotThrow( () => Point({ x: 5, y: 7 }) )
    assert.throws( () => Point() )
    assert.throws( () => Point({ x: 5 }) )
    assert.throws( () => Point({ x: 5, y: null }) )
  })

  it( 'Caches with getStateKey', () => {
    const options = {
      isState: isPoint,
      getStateKey: pointKey
    }

    const Point = ApiFactory( pointModule, options )

    const p1 = Point({ x: 5, y: 7 })
    const p2 = Point({ y: 7, x: 5 })
    const p3 = Point({ x: 5, y: 0 })

    assert.equal( p1, p2 )
    assert.notEqual( p1, p3 )

    const DefaultStateKey = ApiFactory( pointModule )

    const d1 = DefaultStateKey({ x: 5, y: 7 })
    const d2 = DefaultStateKey({ y: 7, x: 5 })
    const d3 = DefaultStateKey({ x: 5, y: 0 })

    assert.notEqual( d1, d2 )
    assert.notEqual( d1, d3 )
  })

  it( 'Overrides previous modules', () => {
    const Point = ApiFactory( pointModule )

    const p1 = Point({ x: 5.5, y: 7.5 })

    const IntegerPoint = ApiFactory( [ pointModule, integerPointModule ] )

    const i1 = IntegerPoint({ x: 5.5, y: 7.5 })

    assert.equal( p1.x(), 5.5 )
    assert.equal( p1.y(), 7.5 )

    assert.equal( i1.x(), 5 )
    assert.equal( i1.y(), 7 )
  })
})
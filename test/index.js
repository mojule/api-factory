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

  const fromNumbersModule = ( api, state ) => {
    return {
      fromNumbers: ( x, y ) => api( { x, y } )
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

  const isIntegerPoint = point =>
    is.object( point ) && is.integer( point.x ) && is.integer( point.y )

  const pointKey = point => `${ point.x } ${ point.y}`

  const parseState = ( Api, ...args ) => {
    if( is.number( args[ 0 ] ) && is.number( args[ 1 ] ) )
      return { x: args[ 0 ], y: args[ 1 ] }
  }

  it( 'Creates an API', () => {
    const Point = ApiFactory( pointModule )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.x(), 5 )
    assert.equal( point.y(), 7 )

    assert.throws( () => ApiFactory( null ) )
  })

  it( 'No Modules', () => {
    assert.doesNotThrow( () => ApiFactory() )
  })

  it( 'Creates an api instance', () => {
    const Point = ApiFactory( [ pointModule, fromNumbersModule ] )

    const p1 = Point({ x: 5, y: 7 })
    const p2 = p1.fromNumbers( 3, 9 )

    assert.equal( p2.x(), 3 )
    assert.equal( p2.y(), 9 )
  })

  it( 'Parses state', () => {
    const Point = ApiFactory( pointModule, { stateParsers: [ parseState ], isState: isPoint } )

    const p1 = Point({ x: 5, y: 7})
    const p2 = Point( 5, 7 )

    assert.equal( p1.x(), 5 )
    assert.equal( p1.y(), 7 )
    assert.equal( p2.x(), 5 )
    assert.equal( p2.y(), 7 )

    assert.throws( () => Point() )
  })

  it( 'Exposes state', () => {
    const Point = ApiFactory( pointModule, { exposeState: true } )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.state.x, 5 )
    assert.equal( point.state.y, 7 )
  })

  it( 'State available internally', () => {
    const internalStateModule = ( api, state, getState ) => {
      return {
        externalState: current => getState( current ),
        internalState: () => getState( api )
      }
    }

    const Point = ApiFactory( [ pointModule, internalStateModule ] )

    const point1 = Point({ x: 5, y: 7 })
    const point2 = Point({ x: 3, y: 9 })

    const state1 = point1.internalState()
    const state2 = point1.externalState( point2 )

    assert.equal( state1.x, 5 )
    assert.equal( state1.y, 7 )
    assert.equal( state2.x, 3 )
    assert.equal( state2.y, 9 )
  })

  it( 'Hides state', () => {
    const Point = ApiFactory( pointModule )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.state, undefined )
    assert.equal( point._state, undefined )
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

  it( 'Can override isState on the API instance', () => {
    const Point = ApiFactory( pointModule )

    Point.isState = isPoint

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

  it( 'Can override getStateKey on the API instance', () => {
    const options = { isState: isPoint }

    const Point = ApiFactory( pointModule, options )

    Point.getStateKey = pointKey

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

  it( 'Can override onCreate on the API instance', () => {
    let value = 0

    const onCreate = p => {
      value = p.x()
    }

    const Point = ApiFactory( pointModule )

    Point.onCreate = onCreate

    const p1 = Point({ x: 5, y: 7 })

    assert.equal( value, 5 )
  })

  it( 'onCreate is called', () => {
    let value = 0

    const onCreate = p => {
      value = p.x()
    }

    const Point = ApiFactory( pointModule, { onCreate } )

    const p1 = Point({ x: 5, y: 7 })

    assert.equal( value, 5 )
  })

  describe( 'static modules', () => {
    const staticModule = ( api, state ) => {
      return {
        $isPoint: isPoint,
        isValid: () => api.isPoint( state )
      }
    }

    const staticStaticsModule = ( api, state ) => {
      return {
        $isPoint: isPoint,
        $isIntegerPoint: p => api.isPoint( p ) && isIntegerPoint( p )
      }
    }

    const overrideStaticModule = ( api, state ) => {
      return {
        $isPoint: isIntegerPoint
      }
    }

    it( 'api has statics', () => {
      const Point = ApiFactory( [ pointModule, staticModule ] )

      const p1 = { x: 5.5, y: 7.5 }

      assert( Point.isPoint( p1 ) )
      assert( !Point.isPoint( {} ) )
    })

    it( 'modules can call statics', () => {
      const Point = ApiFactory( [ pointModule, staticModule ] )

      const p1 = { x: 5.5, y: 7.5 }
      const point1 = Point( p1 )

      assert( point1.isValid() )
    })

    it( 'statics can call statics', () => {
      const Point = ApiFactory( [ pointModule, staticStaticsModule ] )

      const p1 = { x: 5, y: 7 }

      assert( Point.isIntegerPoint( p1 ) )
    })

    it( 'overrides statics', () => {
      const Point = ApiFactory(
        [ pointModule, staticModule, overrideStaticModule ]
      )

      const p1 = { x: 5, y: 7 }
      const p2 = { x: 5.5, y: 7.5 }

      assert( Point.isPoint( p1 ) )
      assert( !Point.isPoint( p2 ) )

      const point1 = Point( p1 )
      const point2 = Point( p2 )

      assert( point1.isValid() )
      assert( !point2.isValid() )
    })
  })

  describe( 'Invalid options', () => {
    it( 'getStateKey', () => {
      assert.throws( () => ApiFactory( pointModule, { getStateKey: {} } ) )
    })

    it( 'isState', () => {
      assert.throws( () => ApiFactory( pointModule, { isState: {} } ) )
    })

    it( 'exposeState', () => {
      assert.throws( () => ApiFactory( pointModule, { exposeState: {} } ) )
    })

    it( 'onCreate', () => {
      assert.throws( () => ApiFactory( pointModule, { onCreate: {} } ) )
    })

    it( 'stateParsers', () => {
      assert.throws( () => ApiFactory( pointModule, { stateParsers: {} } ) )
    })
  })
})
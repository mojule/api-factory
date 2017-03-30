'use strict'

const assert = require( 'assert' )
const is = require( '@mojule/is' )
const ApiFactory = require( '../dist' )

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

  const isIntegerPoint = point =>
    is.object( point ) && is.integer( point.x ) && is.integer( point.y )

  const pointKey = point => `${ point.x } ${ point.y}`

  it( 'Creates an API', () => {
    const Point = ApiFactory( pointModule )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.x(), 5 )
    assert.equal( point.y(), 7 )
  })

  it( 'Exposes state', () => {
    const Point = ApiFactory( pointModule, { exposeState: true } )

    const point = Point({ x: 5, y: 7 })

    assert.equal( point.state.x, 5 )
    assert.equal( point.state.y, 7 )
  })

  it( 'State available internally', () => {
    const internalStateModule = ( api, state ) => {
      return {
        internalState: () => api._state
      }
    }

    const Point = ApiFactory( [ pointModule, internalStateModule ] )

    const point = Point({ x: 5, y: 7 })

    const state = point.internalState()

    assert.equal( state.x, 5 )
    assert.equal( state.y, 7 )
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

  describe( 'private modules', () => {
    const privateModule = ( api, state ) => {
      return {
        _stateKey: () => state.x + '-' + state.y
      }
    }

    const publicModule = ( api, state ) => {
      return {
        stateKey: () => 'state-' + api._stateKey()
      }
    }

    const overridePrivateModule = ( api, state ) => {
      const { _stateKey } = api

      return {
        _stateKey: () => 'new-' + _stateKey()
      }
    }

    it( 'modules can call private', () => {
      const Point = ApiFactory( [ pointModule, privateModule, publicModule ] )

      const p1 = Point({ x: 5.5, y: 7.5 })

      const stateKey = p1.stateKey()

      assert.equal( stateKey, 'state-5.5-7.5' )
    })

    it( 'removes private', () => {
      const Point = ApiFactory( [ pointModule, privateModule, publicModule ] )

      const p1 = Point({ x: 5.5, y: 7.5 })

      assert.equal( typeof p1._stateKey, 'undefined' )
    })

    it( 'retains private', () => {
      const Point = ApiFactory(
        [ pointModule, privateModule, publicModule ],
        { removePrivate: false }
      )

      const p1 = Point({ x: 5.5, y: 7.5 })

      assert.equal( typeof p1._stateKey, 'function' )
    })

    it( 'overrides private', () => {
      const Point = ApiFactory(
        [ pointModule, privateModule, publicModule, overridePrivateModule ]
      )

      const p1 = Point({ x: 5.5, y: 7.5 })

      const stateKey = p1.stateKey()

      assert.equal( stateKey, 'state-new-5.5-7.5' )
    })
  })

  describe( 'static modules', () => {
    const staticModule = ( api, state ) => {
      return {
        $isPoint: isPoint,
        isPoint: () => api.$isPoint( state )
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

      assert( point1.isPoint() )
    })

    it( 'removes statics', () => {
      const Point = ApiFactory( [ pointModule, staticModule ] )

      const p1 = { x: 5.5, y: 7.5 }
      const point1 = Point( p1 )

      assert.equal( typeof point1.$isPoint, 'undefined' )
    })

    it( 'retains statics', () => {
      const Point = ApiFactory(
        [ pointModule, staticModule ],
        { removeStatic: false }
      )

      const p1 = { x: 5.5, y: 7.5 }
      const point1 = Point( p1 )

      assert.equal( typeof point1.$isPoint, 'function' )
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

      assert( point1.isPoint() )
      assert( !point2.isPoint() )
    })
  })
})